import 'reflect-metadata';
import { UserModel } from "../models/user.model.js";
import { SummonerAccountsManager } from "../summoners/summoner.accounts.manager.js";
import { AppDataSource } from "../config/database.config.js";
import { TokensManager } from "../config/tokens.manager.js";
import { imagesVersion } from "../app.js";
import { ChampionsRequestsManager } from "../summoners/champions.requests.manager.js";
export class AccountsService {
    constructor() {
        this.userRepository = AppDataSource.getRepository(UserModel);
    }
    async onCreateUserProfile(requestBody, platform) {
        if (!requestBody.summonerName || !requestBody.email || !requestBody.password) {
            return Promise.reject(new Error("Request Body Info Missing or Data Invalid ..."));
        }
        let userInfo = null;
        await SummonerAccountsManager.getSummonerProfileByInfo(requestBody.summonerName, requestBody.region, requestBody.serverCode).then((result) => {
            userInfo = result;
        }).catch((exception) => {
            console.error(exception);
            return Promise.reject(exception);
        });
        if (userInfo == null) {
            return Promise.reject("Summoner Info Not Found, Check the Server Values");
        }
        const userToInsert = new UserModel();
        userToInsert.regUserAgent = platform;
        userToInsert.summonerName = requestBody.summonerName;
        userToInsert.name = userInfo.name;
        userToInsert.summonerRegion = requestBody.region;
        userToInsert.summonerServerCode = requestBody.serverCode;
        userToInsert.email = requestBody.email;
        userToInsert.password = requestBody.password;
        userToInsert.createdAt = new Date().getTime();
        let creationError = null;
        let insertedUser = null;
        await this.userRepository.save(userToInsert)
            .then(result => insertedUser = result)
            .catch(error => creationError = error);
        if (creationError != null) {
            return Promise.reject("Something Error, User Does not Allowed to Create User with This Info... " + creationError.message);
        }
        const user = this.getUserModelByQuery(insertedUser);
        return Promise.resolve({
            account: user,
            auth: {
                accessToken: TokensManager.onGenerateAccessToken(user),
                refreshToken: TokensManager.onGenerateRefreshToken(user)
            }
        });
    }
    async onLoginAccount(loginRequestBody, platform) {
        if (!loginRequestBody.email || !loginRequestBody.password) {
            return Promise.reject(new Error("Request Body Info Missing or Data Invalid ..."));
        }
        const userToLogin = await this.userRepository.findOne({
            where: {
                email: loginRequestBody.email
            }
        });
        if (userToLogin != null && userToLogin.validatePassword(loginRequestBody.password)) {
            const user = this.getUserModelByQuery(userToLogin);
            return Promise.resolve({
                account: user,
                auth: {
                    accessToken: TokensManager.onGenerateAccessToken(user),
                    refreshToken: TokensManager.onGenerateRefreshToken(user)
                }
            });
        }
        else {
            return Promise.reject(new Error("Email or Password Incorrect, Please Try Again Later ..."));
        }
    }
    getUserModelByQuery(user) {
        delete user.regUserAgent;
        delete user.password;
        return {
            ...user,
            id: Number(user.id),
            createdAt: Number(user.createdAt)
        };
    }
    async getProfileInfoById(userId) {
        const userInstance = await this.userRepository.findOne({
            where: {
                id: userId
            }
        });
        if (!userInstance) {
            return Promise.reject(new Error("User Not Found by This Id or Blocked ..."));
        }
        const summonerInfo = await SummonerAccountsManager.getSummonerProfileByInfo(userInstance.summonerName, userInstance.summonerRegion, userInstance.summonerServerCode);
        const profileMasteryScore = await SummonerAccountsManager.getMasteryPointsByAccountId(userInstance.summonerServerCode, summonerInfo.puuid);
        const topMasteryChampions = await SummonerAccountsManager.getTopMasteryChampionsIcons(userInstance.summonerServerCode, summonerInfo.puuid);
        let topChampionKey = '';
        if (topMasteryChampions && topMasteryChampions.length > 0) {
            topChampionKey = topMasteryChampions[0].name.replace(' ', '');
        }
        let championCoverImage = '';
        if (topChampionKey) {
            championCoverImage = await ChampionsRequestsManager.getChampionCoverImage(topChampionKey);
        }
        return Promise.resolve({
            user: this.getUserModelByQuery(userInstance),
            summonerInfo: {
                level: summonerInfo.summonerLevel,
                coverImage: championCoverImage,
                name: summonerInfo.name,
                masteryPoints: Number(profileMasteryScore),
                accountId: summonerInfo.accountId,
                accountHash: summonerInfo.puuid,
                summonerHighlightName: userInstance.summonerName.split('#')[0],
                serverHighlightName: userInstance.summonerName.split('#')[1],
                profileImage: `https://ddragon.leagueoflegends.com/cdn/${imagesVersion}/img/profileicon/${summonerInfo.profileIconId}.png`,
                ranked: [],
                topChampionsMastery: topMasteryChampions
            }
        });
    }
}
//# sourceMappingURL=accounts.service.js.map