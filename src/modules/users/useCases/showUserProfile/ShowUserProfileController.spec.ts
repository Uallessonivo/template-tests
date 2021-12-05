import { hash } from "bcryptjs";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Show user profile controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const passwordHash = await hash("test", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
      values('${id}', 'test', 'test@test.com', '${passwordHash}', now(), now())
    `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();

    await connection.close();
  });

  it("should be able to show user profile", async () => {
    const user = {
      name: "uallesson",
      password: "uallesson",
      email: "uallesson@uallesson.com",
    };

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send(user);

    const response = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${responseToken.body.token}`);

    expect(response.status).toEqual(200);
    expect(response.body.id).toEqual(responseToken.body.user.id);
  });
});
