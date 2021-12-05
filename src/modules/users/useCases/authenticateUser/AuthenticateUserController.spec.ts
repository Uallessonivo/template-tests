import request from "supertest";
import { app } from "../../../../app";
import { Connection } from "typeorm";
import createConnection from "../../../../database/index";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;
describe("Authenticate user controller", () => {
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

  it("should be able to authenticate an user", async () => {
    const user = {
      password: "uallesson",
      email: "uallesson@uallesson.com",
    };

    const response = await request(app).post("/api/v1/sessions").send(user);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toEqual("uallesson@uallesson.com");
  });

  it("should not be able to authenticate an user with incorrect email", async () => {
    const user = {
      email: "incorrect@uallesson.com",
      password: "uallesson",
    };

    const response = await request(app).post("/api/v1/sessions").send(user);

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate an user with incorrect password", async () => {
    const user = {
      email: "uallesson@uallesson.com",
      password: "wrongpassword",
    };

    const response = await request(app).post("/api/v1/sessions").send(user);

    expect(response.status).toBe(401);
  });
});
