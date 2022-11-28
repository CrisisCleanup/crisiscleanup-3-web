import {Database} from "@vuex-orm/core";
import User from "../models/User";
import Incident from "../models/Incident";
import Location from "../models/Location";
import LocationType from "../models/LocationType";
import Language from "../models/Language";
import Organization from "../models/Organization";
import Report from "../models/Report";
import Role from "../models/Role";
import PhoneStatus from "../models/PhoneStatus";

const database = new Database();
database.register(User, {});
database.register(Incident, {});
database.register(Location, {});
database.register(LocationType, {});
database.register(Language, {});
database.register(Organization, {});
database.register(Report, {});
database.register(Role, {});
database.register(PhoneStatus, {});

export default database;
