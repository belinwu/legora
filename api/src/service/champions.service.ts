import {ChampionModel} from "../response/custom/champion.model.js";
import {championsList, imagesVersion} from "../app.js";
import {ChampionsRequestsManager} from "../summoners/champions.requests.manager.js";
import {AppDataSource} from "../config/database.config.js";
import {UserModel} from "../models/user.model.js";

export class ChampionsService {

    private userRepository = AppDataSource.getRepository(UserModel);

    async getChampionsList(userId: number): Promise<Array<ChampionModel>> {
        const champions = championsList;
        const results = new Array<ChampionModel>()
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            }
        });

        const freeChampionsIds = await ChampionsRequestsManager.getFreeChampionIds(user.summonerServerCode);
        for (let i = 0; i < champions.length; i++) {
            const champion = champions[i];
            results.push({
                id: Number(champion.key),
                name: champion.name,
                icon: `https://ddragon.leagueoflegends.com/cdn/${imagesVersion}/img/champion/${champion.name.replace(" ", "")}.png`,
                isFreeToPlay: freeChampionsIds.includes(Number(champion.key))
            })
        }

        return Promise.resolve(results);
    }
}