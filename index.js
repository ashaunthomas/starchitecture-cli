import { exec } from 'child_process';
const root = process.argv[2];

/*
    Stores components and associated information in the
    following schema:
        Component_Name : {
            Instability_Value: Some_Number, 
            Abstraction_Value: Some_Number
        }
*/ 
let components = {};
let paths = [];

exec('node ' + root);