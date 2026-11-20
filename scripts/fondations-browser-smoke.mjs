import {chromium} from "playwright";
import {spawn} from "node:child_process";
import assert from "node:assert/strict";
const server=spawn("python3",["-m","http.server","8766","--bind","127.0.0.1","--directory","."],{stdio:"ignore"});
let browser;
const errors=[];
const uri="http://127.0.0.1:8766/campus/fondations/";
async function ready(){
 for(let i=0;i<50;i++){
  try{const r=await fetch(uri);if(r.ok)return;}catch{}
  await new Promise(resolve=>setTimeout(resolve,200));
 }
 throw Error("HTTP server unavailable");
}
async function expectText(page,id,text,ms=26000){
 await page.waitForFunction(({id,text})=>document.getElementById(id)?.textContent?.trim()===text,{id,text},{timeout:ms});
}
try{
 await ready();
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||"/usr/bin/google-chrome",args:["--no-sandbox"]});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on("pageerror",e=>errors.push("Desktop: "+e.message));
 const r=await page.goto(uri,{waitUntil:"load"});
 assert.equal(r.status(),200);
 await page.locator("#lesson-nav .nav-lesson").first().waitFor();
 assert.equal(await page.locator("#lesson-nav .nav-lesson").count(),18);
 assert.match(await page.title(),/Fondations C/);
 console.log("PASS 18 missions are accessible in the real browser");
 await expectText(page,"trace-counter","1 / 2");
 await page.locator("#trace-next").click();
 await expectText(page,"trace-counter","2 / 2");
 assert.match(await page.locator("#trace-caption").textContent(),/printf/);
 console.log("PASS illustrative trace changes with deliberate user interaction");
 await page.locator("#prediction-options button").nth(1).click();
 await page.locator("#check-prediction").click();
 assert.match(await page.locator("#prediction-feedback").textContent(),/Pas tout à fait/);
 await page.locator("#prediction-options button").nth(0).click();
 await page.locator("#check-prediction").click();
 assert.match(await page.locator("#prediction-feedback").textContent(),/Bien vu/);
 await expectText(page,"lesson-progress","0 / 18");
 console.log("PASS knowledge prediction provides feedback but does not falsely mark mastery");
 await page.locator("#validate-code").click();
 await expectText(page,"test-counter","0 / 1",36000);
 assert.equal(await page.locator("#completion-dialog").evaluate(n=>n.open),false);
 console.log("PASS first starter program fails genuine C test");
 await page.locator("#code-editor").fill('#include <stdio.h>\nint main(void) {\n printf("Bonjour DEVLAB !\\n");\n return 0;\n}');
 await page.locator("#validate-code").click();
 await expectText(page,"test-counter","1 / 1",36000);
 await page.locator("#completion-dialog[open]").waitFor({timeout:5000});
 await expectText(page,"lesson-progress","1 / 18");
 await page.locator("#stay-lesson").click();
 console.log("PASS C compiler passes correct program and awards only earned completion");
 await page.locator("#lesson-nav .nav-lesson").nth(15).click();
 await expectText(page,"lesson-chip","MISSION 16 / 18");
 await page.locator("#code-editor").fill("int doubler(int n) { return n * 2; }");
 await page.locator("#validate-code").click();
 await expectText(page,"test-counter","4 / 4",38000);
 await page.locator("#completion-dialog[open]").waitFor({timeout:5000});
 await page.locator("#stay-lesson").click();
 await expectText(page,"lesson-progress","2 / 18");
 console.log("PASS function exercise compiles and checks four distinct real C inputs");
 await page.reload({waitUntil:"load"});
 await page.locator("#lesson-nav .nav-lesson").nth(15).click();
 await expectText(page,"lesson-chip","MISSION 16 / 18");
 assert.match(await page.locator("#code-editor").inputValue(),/n \* 2/);
 await expectText(page,"lesson-progress","2 / 18");
 console.log("PASS changes and verified learning persist after reload");
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 mobile.on("pageerror",e=>errors.push("Mobile: "+e.message));
 const mr=await mobile.goto(uri,{waitUntil:"load"});
 assert.equal(mr.status(),200);
 await mobile.locator("#lesson-nav .nav-lesson").first().waitFor();
 await mobile.locator("#trace-next").click();
 await expectText(mobile,"trace-counter","2 / 2");
 const width=await mobile.evaluate(()=>({window:innerWidth,document:document.documentElement.scrollWidth}));
 assert.ok(width.document<=width.window+3,"Mobile horizontal overflow: "+JSON.stringify(width));
 console.log("PASS mobile 390px responsive navigation, trace controls and no page overflow");
 assert.deepEqual(errors,[]);
 console.log("PASS Fondations C browser: pedagogy, real compilation, state, responsive accessibility");
 await mobile.close();
}finally{
 if(browser)await browser.close();
 server.kill("SIGTERM");
}
