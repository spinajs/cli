import { ICliCommand } from "../../src/interfaces";
import { Cli } from "../../src/decorators";

@Cli("cli:command1", "Test cli command 1")
export class Command1 implements ICliCommand
{
    get Name(): string
    {
        return "Command1";
    }
    
    // tslint:disable: no-empty
    public async execute()
    {
        return 0;
    }
}