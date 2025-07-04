import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { throwError } from "#/helpers/throw-error";
import { supabase } from "#/shared/supabase/supabase";
import { getStaticObject, STATIC_BUCKET } from '#/shared/minio/init';

const imageSchema = t.Object({
  id: t.Optional(
    t.String()
  ),
  random: t.Optional(
    t.Boolean()
  )
})

const getRandomArbitrary = (min: number, max: number) => Math.random() * (max - min) + min;

export const publicImage = new Elysia()
  .get("/public-image", async (ctx) => {
    const { id, random } = ctx.query

    try {
      const { data: authImages } = await supabase
        .storage
        .from(STATIC_BUCKET)
        .list("auth_background", { limit: 100, offset: 0 })

      if (!authImages) {
        return ctx.status(HttpStatusEnum.HTTP_404_NOT_FOUND, throwError("Auth images not found"))
      }

      let authImage;

      if (random) {
        const target = getRandomArbitrary(1, authImages.length);

        authImage = authImages[Math.floor(target)]
      } else {
        authImage = authImages.find(image => image.name === `${id}.png`)
      }

      if (!authImage) {
        return ctx.status(HttpStatusEnum.HTTP_404_NOT_FOUND, throwError("Auth image not found"))
      }

      const publicUrl = getStaticObject(`auth_background/${authImage.name}`)

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: publicUrl })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e));
    }
  }, { query: imageSchema })