import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id: sender_id } = request.user;
    const { description, amount } = request.body;
    const { recipient_id } = request.params;

    const createTransferStatementUseCase = container.resolve(
      CreateTransferUseCase
    );
    const statement = await createTransferStatementUseCase.execute({
      sender_id,
      description,
      amount,
      recipient_id,
    });

    return response.json(statement);
  }
}

export { CreateTransferController };
