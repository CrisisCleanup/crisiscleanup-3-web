import {Database} from "@vuex-orm/core";
import User from "../models/User";

const database = new Database();
database.register(User, {});

export default database;
