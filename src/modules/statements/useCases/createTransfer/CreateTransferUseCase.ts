import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { ICreateTransferDTO } from "./ICreateTransferDTO";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    amount,
    description,
    recipient_id,
    sender_id,
  }: ICreateTransferDTO) {
    const sender = await this.usersRepository.findById(sender_id);
    const recipient = await this.usersRepository.findById(recipient_id);

    if (!sender) {
      throw new Error("User not found");
    }

    if (!recipient) {
      throw new Error("User not found");
    }

    const balance = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });

    if (balance.balance < amount) {
      throw new Error("Not enough balance");
    }

    await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER,
      sender_id,
      user_id: recipient_id,
    });
  }
}

export { CreateTransferUseCase };
