<script>
    import {aoviSvelte} from 'aovi-svelte';

    const form = aoviSvelte({
        user: '',
        password: '',
        confirm: ''
    });

    const confirm_ok = form.checker('confirm',(a,obj) => a.is( c => c===obj.password));

    let registered = false;
    function doSubmit(){
        form.aovi
            .check('user')
                .required()
                .minLength(4)
            .check('password')
                .required()
            .check('confirm')
                .required()
                .is(v => v===$form.password,'is differ from password')
            .end

        if($form.valid){
            registered=true;
        }
    }
</script>

<div class="container">
    {#if registered}
        <h1>Success!</h1>

        Registration complete.
    {:else}
    <h1>Register form</h1>

    <p> User: <br/>
        <input bind:value={$form.user} class:error={$form.err.user} on:focus={form.clear}  />
    </p>
    
    <p> Password: <br/>
        <input type="password" bind:value={$form.password} class:error={$form.err.password} name="test"   class:good={$confirm_ok}  on:focus={form.clear}/>
    </p>

    <p> Confirm: <br/>
        <input type="password" bind:value={$form.confirm} class:error={$form.err.confirm}  class:good={$confirm_ok}  on:focus={form.clear}/>
    </p>

    {#if !$form.valid}
    <p class="errortab">
        {#each $form.err.toArray() as error }
            <div>{error}</div>
        {/each}
    </p>
    {/if}

    <p style="text-align: center"> 
        <button on:click={doSubmit}>Register</button>
    </p>
    {/if}
</div>





<style>
    :global(body){
        background-color: aliceblue;
        font-size: 20px;
    }

    .container{
        max-width: 600px;
        background-color: white;
        border-radius: 10px;
        margin:20px auto;
        padding:10px;
        border: 1px solid silver;
    }

    input{
        width:100%;
        border: 2px solid silver;
        border-radius: 5px;
    }

    .error{
        border-color: red !important;
        background-color: #ffc6c6 !important;
    }

    .good{
        border-color: green;
        background-color: #adffaa;
    }

    .errortab{
        border: 2px solid red;
        padding: 10px;
        color: red;
        border-radius: 5px;
    }
</style>