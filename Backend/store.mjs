import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
const storageDir=process.env.ALKULE_DATA_DIR||path.join(process.cwd(),"Backend","storage");const dataFile=path.join(storageDir,"data.json");const seed={users:[],progress:[],newsletters:[]};let writeQueue=Promise.resolve();
export async function readStore(){await mkdir(storageDir,{recursive:true});try{return JSON.parse(await readFile(dataFile,"utf8"))}catch(error){if(error.code!=="ENOENT")throw error;await writeStore(seed);return structuredClone(seed)}}
export function writeStore(data){writeQueue=writeQueue.then(async()=>{await mkdir(storageDir,{recursive:true});const temporary=`${dataFile}.tmp`;await writeFile(temporary,JSON.stringify(data,null,2),"utf8");await rename(temporary,dataFile)});return writeQueue}
export async function updateStore(change){const data=await readStore();const result=await change(data);await writeStore(data);return result}
