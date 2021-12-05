import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe("Create statement", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should not be able to create a statement for a non-existent user", async () => {
    await expect(async () => {
      const statement = {
        user_id: "1234",
        amount: 500,
        description: "Deposit Test statement",
        type: OperationType.DEPOSIT,
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should be able to create a statement with deposit type", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "uallesson",
      password: "uallesson",
      email: "uallesson@uallesson.com",
    });

    if (!user.id) return;

    const statement = {
      user_id: user.id,
      amount: 1000,
      description: "Deposit Test statement",
      type: OperationType.DEPOSIT,
    };

    const depositStatement = await createStatementUseCase.execute(statement);

    expect(depositStatement).toMatchObject(statement);
  });

  it("should be able to create a statement with withdraw type", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "uallesson",
      password: "uallesson",
      email: "uallesson@uallesson.com",
    });

    if (!user.id) return;

    await createStatementUseCase.execute({
      user_id: user.id,
      amount: 1000,
      description: "Test deposit statement",
      type: OperationType.DEPOSIT,
    });

    const statement = {
      user_id: user.id,
      amount: 700,
      description: "Test withdraw statement",
      type: OperationType.WITHDRAW,
    };

    const withdrawStatement = await createStatementUseCase.execute(statement);

    expect(withdrawStatement).toMatchObject(statement);
  });

  it("should not be able to create a statement with withdraw type if funds are insufficient", async () => {
    await expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "uallesson",
        password: "uallesson",
        email: "uallesson@uallesson.com",
      });

      if (!user.id) return;

      await createStatementUseCase.execute({
        user_id: user.id,
        amount: 100,
        description: "Test deposit statement",
        type: OperationType.DEPOSIT,
      });

      const statement = {
        user_id: user.id,
        amount: 700,
        description: "Test withdraw statement",
        type: OperationType.WITHDRAW,
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
