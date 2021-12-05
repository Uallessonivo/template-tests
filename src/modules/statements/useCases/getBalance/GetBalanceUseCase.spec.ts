import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe("Get balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get user's balance", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "uallesson",
      password: "uallesson",
      email: "uallesson@uallesson.com",
    });

    if (!user.id) return;

    await inMemoryStatementsRepository.create({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      description: "Test user balance deposit description",
      amount: 1750,
    });

    const balance = await getBalanceUseCase.execute({ user_id: user.id });

    expect(balance.balance).toEqual(1750);
  });

  it("should not be able to get balance from non-existent user", async () => {
    await expect(async () => {
      await getBalanceUseCase.execute({ user_id: "12345" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
