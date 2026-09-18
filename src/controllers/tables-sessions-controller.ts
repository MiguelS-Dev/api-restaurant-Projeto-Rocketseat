import {NextFunction, Request, Response} from "express";
import {z} from "zod";
import {knex} from "@/database/knex";
import { AppError } from "@/utils/AppError";

class TablesSessionsController {
  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        table_id: z.number(),
      });

      const { table_id } = bodySchema.parse(request.body);

      const session = await knex<TablesSessionsRepository>("tables_sessions").where({table_id}).orderBy("opened_at", "desc").first();

      if (session && !session.closed_at) {
        throw new AppError("this table is already open");
      }

      const table = await knex("tables").where({ id: table_id }).first();

      if (!table) {
        throw new AppError("Table not found", 404);
      }

      await knex<TablesSessionsRepository>("tables_sessions").insert({
        table_id,
        opened_at: knex.fn.now(),
      });

      const tableSession = await knex<TablesSessionsRepository>("tables_sessions")
        .where({ table_id })
        .orderBy("id", "desc")
        .first();

      return response.status(201).json(tableSession);
    } catch (error) {
      next(error)
    }
  }

  async index(request: Request, response: Response, next: NextFunction) {
    try {
      const sessions = await knex<TablesSessionsRepository>(
        "tables_sessions"
      ).orderBy("closed_at");

      return response.json(sessions);
    } catch (error) {
      next(error);
      }
  }


  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const id = z.string().transform((value) => parseInt(value, 10)).refine((value) => !isNaN(value), {message: "id must be a number"}).parse(request.params.id);

      const session = await knex<TablesSessionsRepository>("tables_sessions").where({ id }).first();

      if (!session) {
        throw new AppError("Session not found");
      }

      if(session.closed_at) {
        throw new AppError("this session table is already closed");
      }

      await knex<TablesSessionsRepository>("tables_sessions").update({closed_at: knex.fn.now()}).where({ id });

      return  response.json()
    } catch (error) {
      next(error);
    }
  }
}

export { TablesSessionsController };