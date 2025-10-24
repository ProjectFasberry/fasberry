import { APP_OPTIONS_KEY } from "@/shared/models/app.model";
import { AppOptionsPayload } from "@repo/shared/types/entities/other";
import { redirect } from "vike/abort";
import { PageContextServer } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(pageContext: PageContextServer) {
  const actualSnapshot = pageContext.snapshot[APP_OPTIONS_KEY].data as AppOptionsPayload;

  if (!actualSnapshot) {
    throw new Error("Snapshot is not defined")
  }

  const isBanned = actualSnapshot.isBanned;

  if (!isBanned) {
    throw redirect("/")
  }
}