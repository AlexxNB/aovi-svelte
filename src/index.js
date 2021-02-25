import {aovi} from 'aovi';
import {writable,derived} from 'svelte/store';

const glCustomValidators = [];
const reserved = ['err','valid'];
let id = 0;

export function aoviSvelte(obj){

    for(let prop of reserved){
        if(!!obj[prop]) throw new Error(`Name of property in object "${prop}" is reserved for internal use`);
    }

    clearErrors(obj);
    
    const {subscribe,set,update} = writable(obj);

    return {
        subscribe,
        set,
        clear: _ => update( o => clearErrors(o)),
        get aovi(){
            let a = get_aovi(obj);
            Object.defineProperty(a, 'end', {
                get: ()=>set(makeErrorsFromResultArray(obj,a.array()))
            });
            return a;
        },
        error: ( error, name )=>set(addError(obj,error,name)),
        load: result => {
            if(!Array.isArray(result)) return;
            set(makeErrorsFromResultArray(obj,result));
        },
        checker(name,chk){
            if(!obj.hasOwnProperty(name)) throw new Error(`Unknown property ${name}`)
            return derived(this,$obj => {
                return chk(get_aovi($obj).check(name).required(),filterObject($obj)).valid;
            });
        },
        get(){
            const args = Array.from(arguments);
            return args.length ===  0 ?
                filterObject(obj) :
                Object
                    .entries(filterObject(obj))
                    .reduce((o,[n,v])=>args.includes(n) ? (o[n]=v,o) : o,{});
            
        }
    }
}

export function use(custom_validator){
    glCustomValidators.push(custom_validator);
}

function get_aovi(obj){
    const custom_aovi = aovi(obj);
    for(let cv of glCustomValidators){
        custom_aovi.use(cv)
    }
    return custom_aovi;
}

function addError(obj,error,name){
    if(name && !obj.hasOwnProperty(name)) return console.warn(`Got unknown property '${name}'`)
    obj.err[name||`noname_${id++}`] = error;
    obj.valid = false;
    return obj;
}

function clearErrors(obj){
    obj.err = Object.keys(obj)
        .filter(n=>!reserved.includes(n))
        .reduce((o,name)=>(o[name]=false,o),{});
    obj.err.toArray = ()=>err2Array(obj.err);
    obj.valid = true;
    return obj;
}

function makeErrorsFromResultArray(obj,result){
    clearErrors(obj);
    result.forEach( e => {
        addError(obj,e.error,e.name);
    });
    return obj;
}

function err2Array(errs){
    return Object.values(errs).filter(e=>typeof e === 'string');
}

function filterObject(obj){
    return Object.entries(obj).reduce((o,[n,v])=>reserved.includes(n) ? o : (o[n]=v,o),{});
}