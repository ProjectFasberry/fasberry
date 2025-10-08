export type StatusPayload = {
  proxy: {
    status: string;
    online: number;
    max: number;
    players: string[];
  };
  servers: {
    bisquite: {
      online: number;
      max: number;
      players: string[];
      status: string;
    };
  };
}

export type EventPayload = {
  id: string;
  type: string,
  title: string,
  content: {
    created_at: string | Date,
    description: string | null,
    initiator: string
  }
}

export type AppOptionsPayload = {
  bannerIsExists: boolean
}

export type SeemsLikePlayer = {
  nickname: string,
  uuid: string,
  seemsRate: number
}

export type SeemsLikePlayersPayload = {
  data: SeemsLikePlayer[],
  meta: {
    count: number
  }
}