<script>
    import {validate} from './../dist/aovistore.svelte.js';

    const vld = validate({
        user: '',
        password: ''
    });

    const good_password = vld.checker('password',a => a
        .minLength(4)
    );

    function doSubmit(){
        vld.aovi
            .check('user')
                .required()
                .minLength(4)
            .check('password')
                .required()
            .end
    }

    function doLoad(){
        vld.load([
            {name: 'password', error: 'Wrong password'}
        ])
    }

    $: console.log($vld);
</script>

<p> User: <br/>
    <input bind:value={$vld.user} class:error={$vld.err.user}/>
</p>

<p> Password: <br/>
    <input bind:value={$vld.password} class:error={$vld.err.password}  class:good={$good_password} />
</p>


<p class="errortab">
    {#each $vld.err.toArray() as error }
        <div>{error}</div>
    {/each}
</p>

<p> 
    <button on:click={doSubmit}>Submit</button>
    <button on:click={doLoad}>Load</button>
</p>

<h1>Hello {$vld.user}!</h1>

<style>
    .error{
        border: 1px solid red !important;
    }

    .good{
        border: 1px solid green;
    }

    .errortab{
        border: 1px solid red;
        color: red;
    }
</style>