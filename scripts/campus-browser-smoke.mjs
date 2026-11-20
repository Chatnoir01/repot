import {chromium} from "playwright";
import {spawn} from "node:child_process";
import assert from "node:assert/strict";
const server=spawn("python3",["-m","http.server","8765","--bind","127.0.0.1","--directory","."],{stdio:"ignore"});
let browser;
const failures=[];
const base="http://127.0.0.1:8765/campus/";
async function ready(){
 for(let i=0;i<40;i++){
  try{const res=await fetch(base);if(res.ok)return;}catch{}
  await new Promise(r=>setTimeout(r,250));
 }
 throw Error("Local HTTP server failed to start");
}
async function expectText(page,id,expected,ms=20000){
 await page.waitForFunction(({id,expected})=>document.getElementById(id)?.textContent?.trim()===expected,{id,expected},{timeout:ms});
}
try{
 await ready();
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:1366,height:900},acceptDownloads:true});
 page.on("pageerror",e=>failures.push("Browser JS error: "+e.message));
 const response=await page.goto(base,{waitUntil:"load"});
 assert.equal(response.status(),200);
 await page.waitForSelector("#project-navigation button");
 console.log("PASS Campus UI loads");
 await page.locator('[data-track-select="js"]').click();
 await expectText(page,"breadcrumb-track","JAVASCRIPT");
 await page.locator("#code-editor").fill('function doubler(n){return n*2;}\nconsole.log("preuve",doubler(4));');
 await page.locator("#btn-test").click();
 await expectText(page,"checks-count","3 / 3",16000);
 assert.match(await page.locator("#result-console").textContent(),/preuve 8/);
 console.log("PASS JavaScript engine executes and grades three real calls");
 await page.locator("#code-editor").fill("while(true){}");
 await page.locator("#btn-run").click();
 await expectText(page,"runtime-status","ERREUR JS",12000);
 console.log("PASS infinite JavaScript loop is interrupted");
 await page.locator('[data-track-select="web"]').click();
 await expectText(page,"breadcrumb-track","HTML & CSS");
 const preview=page.frameLocator("#preview-frame");
 await preview.locator("h1").waitFor({timeout:10000});
 assert.match(await preview.locator("h1").textContent(),/Une idée prend forme/);
 assert.equal(await page.locator("#preview-frame").getAttribute("sandbox"),"");
 await page.locator("#btn-practised").click();
 await expectText(page,"checks-count","PRATIQUÉ");
 console.log("PASS HTML/CSS preview and honest manual checkpoint");
 await page.locator('[data-track-select="c"]').click();
 await expectText(page,"breadcrumb-track","LANGAGE C");
 await page.locator("#code-editor").fill('#include <stdio.h>\nint main(void){printf("Bonjour DEVLAB !\\n");return 0;}');
 await page.locator("#btn-test").click();
 await expectText(page,"checks-count","1 / 1",40000);
 assert.match(await page.locator("#result-console").textContent(),/Bonjour DEVLAB/);
 console.log("PASS C is actually compiled to WASM in browser and validated");
 await page.reload({waitUntil:"load"});
 await page.waitForSelector("#project-navigation button");
 assert.match(await page.locator("#code-editor").inputValue(),/Bonjour DEVLAB/);
 console.log("PASS projects and progress survive reload");
 assert.deepEqual(failures,[]);
 console.log("PASS all Campus browser tests");
}finally{
 if(browser)await browser.close();
 server.kill("SIGTERM");
}
