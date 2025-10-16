import Elysia from 'elysia';
import { skinDownload } from './skin-download.route';
import { skin } from './skin-data.route';

export const playerSkin = new Elysia()
  .group("/skin", app => app
    .use(skin)
    .use(skinDownload)
  )