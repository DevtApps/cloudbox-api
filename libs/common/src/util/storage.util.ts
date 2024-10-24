import { QueryTypes } from "sequelize";
import { Archive } from "src/database/entities/archive.entity";

export async function getHierarch(archive: string):Promise<string[]>{
    let hierarch = await Archive.sequelize.query(
      `SELECT * FROM get_folder_hierarchy(:lastFolderUid::UUID)`,
      {
        replacements: { lastFolderUid: archive },
        type: QueryTypes.SELECT,
      }
    );
    return hierarch.reverse().map((e) => e['uid'])
  }