import { ICliCommand } from "../../src/interfaces";
import { Cli, Option } from "../../src/decorators";


@Cli("cli:command2 <dir>", "Test cli command 2")
@Option("--option1","Option 1")
@Option("--option2 <value>","Option 2")
export class CommandWithArgs implements ICliCommand
{
    get Name(): string
    {
        return "Command1";
    }
    
    // tslint:disable: no-empty
    public async execute(_arg1: string, _arg2: number)
    {
        return 0;
    }
}