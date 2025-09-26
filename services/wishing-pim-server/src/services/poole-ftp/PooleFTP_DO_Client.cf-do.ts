// DurableObject 从 cloudflare:workers 这个运行时模块导入是必须的, 否则会报错.
import { DurableObject } from "cloudflare:workers";
import { PooleFTP_Client } from ".";

const oldAllFilesStateR2MainPath =
  "_system/poole-ftp/cf-do/oldAllFilesState.csv";

export class PooleFTP_DO_Client extends DurableObject<Env> {
  private pooleFTP_Client: PooleFTP_Client | null = null;
  private allFilesDF: dfdType.DataFrame | null = null;

  constructor(ctx: DurableObjectState, cEnv: Env) {
    super(ctx, cEnv);
    console.log("zzx58, cf-do");
    ctx.blockConcurrencyWhile(async () => {
      // const oldAllFilesState = await cEnv.R2_Main.get(
      //   oldAllFilesStateR2MainPath
      // );
      // if (oldAllFilesState) {
      //   this.allFilesDF = await dfd.readCSV(oldAllFilesState);
      // } else {
      //   const test = new dfd.DataFrame([0, 1, 2, 3]);
      //   const csv = dfd.toCSV(test);
      //   if (csv) {
      //     const result = await cEnv.R2_Main.put(
      //       oldAllFilesStateR2MainPath,
      //       csv,
      //       {
      //         httpMetadata: {
      //           contentType: "text/csv",
      //         },
      //       }
      //     );
      //   } else {
      //     console.error("Failed to convert DataFrame to CSV, CSV is void");
      //   }
      // }
      // this.allFiles =
      //   (await ctx.storage.get<PooleFTP_FileSchema[]>("_allFiles")) || [];
    });

    this.pooleFTP_Client = new PooleFTP_Client(cEnv);
  }

  test() {
    return "hello from do object";
  }
}
