import { Database } from '@vuex-orm/core'
import User from '@/models/User'
import Worksite from "@/models/Worksite";
import Incident from "@/models/Incident";
import WorkType from "@/models/WorkType";

const database = new Database()

database.register(User, {})
database.register(Worksite, {})
database.register(Incident, {})
database.register(WorkType, {})

export default database
