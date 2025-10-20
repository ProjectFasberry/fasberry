import Elysia from 'elysia';
import { skinDownload } from './skin-download.route';
import { skin as skinData } from './skin-data.route';

export const skin = new Elysia()
  .group("/skin", app => app
    .use(skinData)
    .use(skinDownload)
  )