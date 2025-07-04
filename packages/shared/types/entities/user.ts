import { Donate } from "./donate-type"

export type User = {
  nickname: string,
  lowercase_nickname: string,
  uuid: string,
  group: Donate,
  avatar: string;
  details: {
    reg_date: string | Date,
    login_date: string | Date,
  },
}