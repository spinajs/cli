import { DI } from "@spinajs/di";
import { Configuration, FrameworkConfiguration } from "@spinajs/configuration";
import { SpinaJsDefaultLog, LogModule } from "@spinajs/log";
import { FrameworkCliModule } from "../module";

async function start_cli() {
    
    DI.register(FrameworkConfiguration).as(Configuration);
    DI.register(SpinaJsDefaultLog).as(LogModule);

    await DI.resolve(Configuration, [null, process.cwd()])
    await DI.resolve(LogModule);
    await DI.resolve(FrameworkCliModule);
}

start_cli();