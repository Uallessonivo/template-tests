interface ICreateTransferDTO {
  amount: number;
  description: string;
  sender_id: string;
  recipient_id: string;
}

export { ICreateTransferDTO };
