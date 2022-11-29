import { store } from '../../store';
import User from "../../models/User";

function $can(rule: string) {
    const currentUser = User.find(store.getters["auth/userId"]);
    const acl = store.getters["acl/acl"];
    return acl.can(currentUser, rule)
}

export default function useAcl() {
    return {
        $can,
    };
}
