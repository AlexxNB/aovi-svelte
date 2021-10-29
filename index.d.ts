import {ValidationError,Aovi,AoviTestObject,ValidatorCreator} from 'aovi';
import {Readable} from 'svelte/store'

declare type Subscriber = (value: ValidationStore) => void;
declare type CheckerFunc = (aovi:Aovi)=>Aovi;

declare type AoviExtended  = Aovi & {
    end:()=>void|Promise<void>
}

declare interface ValidationStore {
    valid: boolean,
    err:{
            toArray: ()=>[ValidationError]
        }&{
            [key: string]:boolean|string
        }
    [key: string]: any
}

declare interface AoviSvelte {
    /** Svelte store subscription */
    subscribe: Subscriber,

    /** Set value of the store directly */
    set(validation_store: ValidationStore): void;

    /** Returns aovi object to call validators. 
     * You must finish chain with .end operator, 
     * to proceed validation and update store. */
    aovi: AoviExtended,

    /**
     * Clear all errors. Make <$store>.valid true;
     */
    clear: ()=>void,

    /**
     * If no arguments specified, returns an initial object with current values. 
     * You can specify what properties should be in object by providing their names as a function arguments.
     */
    get: (...properties:[string])=>Record<string,any>,

    /** Add a new error message for the property in the store. 
     * If property ommited, add anonymus message, 
     * which will be appeared only in <$store>.err.toArray() call. 
     * Make <$store>.valid false; 
     * 
     * @param message Error message
     * @param property Name of the property
     * */
    error: (message:string,property?:string)=>void,

    /** Load aovi's result array in the validation store. 
     * May be used when you got aovi validation responce from the sever.
     *  */
    load: (errors:[ValidationError])=>void,

    /** Returns checker store, which has value true or false, based 
     * on the current value of the property and validation chain from func. 
     * 
     * @param property Name of the property which will be checked
     * @param func Checker function which get aovi object as a first parameter, you must chain validators (except .required and .check ) to this object and return it.
     * */
    checker: (property:string,func:CheckerFunc)=>Readable<Boolean>
}

/** Returns the aoviSvelte store 
 * @param test_object The object which properties will be validated
*/
export function aoviSvelte(test_object:AoviTestObject): AoviSvelte;

/**
 * Globally adds aovi custom validators. Usually called in app's root file like App.svelte.
 * @param custom_validator Function of custom validator
 * @see https://github.com/AlexxNB/aovi#custom-validators
 */
export function use(custom_validator:ValidatorCreator): void;