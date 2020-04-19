# aovi-svelte

Easy using Aovi in your Svelte apps 

<p align="center">
  <img src="https://raw.githubusercontent.com/AlexxNB/aovi-svelte/master/screencast.gif">
</p>

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
function authUser(req,res){
    const checkPassword = password => password === '12345';

    let result  = aovi(req.body).
        .check('password')
            .required()
            .is(checkPassword,"Wrong password");

    res.end(result.toJSON())
}
```

#### Client form
```html
<script>
    import {aoviSvelte} from 'aovi-svelte';
    const form = aoviSvelte({
        password: ''
    });

    async function doLogin(){
        const responce = await fetch('.../api/auth',{
            method:'POST',
            body:JSON.stringify({password: $form.password})
        }); 
        $form.load(await responce.json());
        if($form.valid){
            console.log('User authed!');
        }
    }
</script>

Password: 
<input bind:value={$form.password}/>
{#if !#form.valid}{$form.err.password}{/if}

<button on:click={doLogin}>Login</button>
```

## Checkers

You can make special stores for any `property` which will return `true` or `false` each time value changes.

```html
<script>
    import {aoviSvelte} from 'aovi-svelte';
    const form = aoviSvelte({
        password: ''
    });

    const good_password = form.checker('password',aovi => aovi.minlength(8).match(/[A-Z]/));
</script>

<input bind:value={$form.password}/>
{#if $good_password}
    Your password is strong!
{:else}
    Please enter more than 8 signs and at least 1 capital letter.
{/if}
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

### `<store>.error(message,[property])`
Add a new error message for the `property` in the store. If `property` ommited, add anonymus message, which will be appeared only in `<$store>.err.toArray()` call. Make `<$store>.valid` false;

### `<store>.load(result_array)`
Load aovi's result array in the validation store. May be used when you got aovi validation responce from the sever.

### `<store>.checker(property,func)`
Returns checker store, which has value `true` or `false`, based on the current value of the `property` and validation chain from `func`.  The func get aovi object as a parameter. You must chain validators (except `.required` and `.check` ) to this object and return it.

### `<$store>.valid`
Equal `true` when no validation errors, `false` when there is at least one error occured.

### `<$store>.<property>`
Current `property` value. 

### `<$store>.err.<property>`
Equal `false` when no validation error for the `property`, or text of the error in other case.

### `<$store>.err.toArray()`
Returns all errors messages as array. Returns `[]` when no errors.
