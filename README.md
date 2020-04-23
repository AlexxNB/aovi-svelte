# aovi-svelte

Easy using [Aovi](https://www.npmjs.com/package/aovi) in your Svelte apps 

<p align="center">
  <img src="https://raw.githubusercontent.com/AlexxNB/aovi-svelte/master/screencast.gif">
</p>

*See in [REPL](https://svelte.dev/repl/90668378fbd4427792a5319b70d1f459)*

## Features

* Based on Svelte's store feature
* One store may be used for different validation chains in same component(s)
* Instant [checkers](#checkers) for any property in the store
* Easy to use with aovi validator on the server side

## Common example

```html
<script>
    import {aoviSvelte} from 'aovi-svelte';

    // Create the aoviSvelte store containing object of values to be validated
    const form = aoviSvelte({
        user: '',
        password: ''
    });

    function doSubmit(){
        // Run aovi validators
        form.aovi
            .check('user')
                .required()
                .match(/^[a-z]+$/)
            .check('password')
                .required()
                .minLength(4)
            .end // You must always use .end operator

        if($form.valid){ // when aovi checks was successful, do thing
            fetch(...)
        }
    }
</script>

User: 
<input bind:value={$form.user} class:error={$form.err.user}/>

Password: 
<input bind:value={$form.password} class:error={$form.err.password} />

{#if !$form.valid}
    {#each $form.err.toArray() as error}
        <p>{error}</p>
    {/if}
{/if}

<button on:click={doSubmit}>Submit</button>
```

## Example with aovi validator on the server

#### Server request handler
```js
// handler for http-request with body_parser.json middleware
const aovi = require('aovi');
function authUser(req,res){
    const checkPassword = password => password === '12345';

    // Validate form object from request body(after body_parser.json
    let result  = aovi(req.body)
        .check('password')
            .required()
            .is(checkPassword,"Wrong password");

    // send responce as JSON string 
    res.end(result.toJSON())
}
```

#### Client form
```html
<script>
    import {aoviSvelte} from 'aovi-svelte';

    // Create validation store
    const form = aoviSvelte({
        password: ''
    });

    async function doLogin(){
        // do request to the server
        const responce = await fetch('.../api/auth',{
            method:'POST',
            body:JSON.stringify({password: $form.password}) //OR (form.get()) to send all $form entries
        }); 

        // load validation result from server and update the store
        form.load(await responce.json());
        
        // do some staff if validation was ok
        if($form.valid){
            console.log('User authed!');
        }
    }
</script>

Password: 
<input bind:value={$form.password}/>
{#if !$form.valid}{$form.err.password}{/if}

<button on:click={doLogin}>Login</button>
```

## Checkers

Checkers are special stores derived from any `property` in the aoviSvelte store. Its subscription returns `true` or `false` each time the value changes.

```html
<script>
    import {aoviSvelte} from 'aovi-svelte';
    const form = aoviSvelte({
        password: ''
    });

    // checker will be true if password value is strong password.
    const good_password = form.checker('password',aovi => aovi.minlength(8).match(/[A-Z]/));
</script>

<input bind:value={$form.password}/>
{#if $good_password}
    Your password is strong!
{:else}
    Please enter more than 8 signs and at least 1 capital letter.
{/if}
```

## Custom validators

You can use any [aovi custom validator](https://www.npmjs.com/package/aovi#custom-validators). The best way is to declare it in the your app's root file like `App.svelte`:

```html
<script>
    ...
    import {use} from 'aovi-svelte';
    import {between} from './my-custom-validators.js';

    ...
    use(between);
</script>
```
Then you can use this custom validator in the any chain in your other files.

```html
<script>
    import {aoviSvelte} from 'aovi-svelte';
    ...
    form.aovi
        .check('my_number')
            .required()
            .between(0,10);
    ...
</script>

```

## API

### `aoviSvelte(object_to_validate)`
Returns the aoviSvelte store

### `use(custom_validator)`
Globally adds aovi [custom validators](https://github.com/AlexxNB/aovi#custom-validators). Usually called in app's root file like `App.svelte`.

### `<store>.aovi`
Returns aovi object to call validators. You *must* finish chain with `.end` operator, to proceed validation and update store.

### `<store>.clear()`
Clear all errors. Make `<$store>.valid` true;

### `<store>.get([property][,property]...)`
If no arguments specified, returns an initial object with current values. You can specify what properties should be in object by providing their names as a function arguments.

### `<store>.error(message,[property])`
Add a new error message for the `property` in the store. If `property` ommited, add anonymus message, which will be appeared only in `<$store>.err.toArray()` call. Make `<$store>.valid` false;

### `<store>.load(result_array)`
Load aovi's result array in the validation store. May be used when you got aovi validation responce from the sever.

### `<store>.checker(property,func)`
Returns checker store, which has value `true` or `false`, based on the current value of the `property` and validation chain from `func`.  The `func` get aovi object as a first parameter, you must chain validators (except `.required` and `.check` ) to this object and return it. The second parameter is an object with all current values in the parent store for easy compare them inside the callback-function.

### `<$store>.valid`
Equal `true` when no validation errors, `false` when there is at least one error occured.

### `<$store>.<property>`
Current `property` value. 

### `<$store>.err.<property>`
Equal `false` when no validation error for the `property`, or text of the error in other case.

### `<$store>.err.toArray()`
Returns all errors messages as array. Returns `[]` when no errors.
