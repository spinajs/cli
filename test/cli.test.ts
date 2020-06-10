import { FrameworkCliModule } from './../src/index';
import 'mocha';

import { expect } from 'chai';
import { DI } from '@spinajs/di';
import { Configuration } from "@spinajs/configuration";
import { CliModule } from "../src/index";
import { CliConf } from './fixture';
import sinon from 'sinon';
import { Command1 } from './commands/Command1';
import { CommandWithArgs } from './commands/CommandWithArgs';
import { LogModule, SpinaJsDefaultLog } from '@spinajs/log';


function cli(options: string[]) {
    return DI.resolve<CliModule>(CliModule,[["C:\\Program Files\\nodejs\\node.exe","clitest.js"].concat(options)]);
}


describe("Cli tests", () => {

    beforeEach(() => {

        DI.clear();
        DI.register(CliConf).as(Configuration);
        DI.register(FrameworkCliModule).as(CliModule);
        DI.register(SpinaJsDefaultLog).as(LogModule);

        DI.resolve(LogModule);
    });

    afterEach(async () => {
        DI.clear();
        process.argv = [];
    });

    it("Should load commands", async () => {
        const c = await cli(["cli:command1"]);
        expect(c.Commands.length).to.eq(2);
    });

    it("Should run command", async () => {
        
        const callback = sinon.spy(Command1.prototype, "execute");
 
        await cli( ["cli:command1"]);

        expect(callback.calledOnce).to.be.true;
    });

    it("Should run command with options", async () => {

        const callback = sinon.spy(CommandWithArgs.prototype, "execute");

        await cli(["cli:command2","testpath", "--option1"]);

        expect(callback.calledOnce).to.be.true;
        expect(callback.args[0].length).to.eq(2);
        expect(callback.args[0][0]).to.eq("testpath");
        expect((callback.args[0][1] as any).option1).to.eq(true);



    });


});
