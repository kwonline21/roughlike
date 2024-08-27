import chalk from "chalk";
import readlineSync from "readline-sync";

class Player {
  constructor() {
    this.hp = 100;
    this.att = 25;
    this.bullet = {
      pistol: 0,
      shotgun: 0,
      grenade: 0,
    };
    this.accuracy = {
      pistol: { min: 26, max: 25 }, // 25 ~ 50
      shotgun: { min: 11, max: 5 }, // 5 ~ 15
      grenade: { min: 26, max: 75 }, // 75 ~ 100
    };
  }

  attack(monster) {
    // 플레이어의 공격
    monster.hp -= this.att;
  }
}

class Monster {
  constructor(stage) {
    if (stage === 1) {
      this.hp = 100;
      this.att = 2.5;
    } else if (stage > 1) {
      this.hp = 100 + stage * 7;
      this.att = 3.5 + stage * 3;
    }
  }

  attack(player) {
    // 몬스터의 공격
    player.hp -= this.att;
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
      chalk.blueBright(`| Player HP:${player.hp}, Attack: ${player.att} `) +
      chalk.redBright(`| Monster HP:${monster.hp}, Attack: ${monster.att} |`)
  );
  console.log(
    chalk.greenBright(
      `| Knife: 1, Pistol: ${player.bullet.pistol}, Shotgun: ${player.bullet.shotgun}, Grenade: ${player.bullet.grenade} |`
    )
  );
  console.log(chalk.magentaBright(`======================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  if (stage > 1) {
    logs.push(chalk.yellowBright(`****STAGE CLEAR****`));
    logs.push(chalk.green(`체력이 30 회복되었습니다!`));
    logs.push(chalk.green(`탄약을 획득했습니다!`));
  }
  if (stage >= 3) {
    logs.push(chalk.bgGreenBright(`랜덤한 무기 숙련도 증가!`));
  }

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. Knife 2. Pistol(${player.accuracy.pistol.max}-${player.accuracy.pistol.max + player.accuracy.pistol.min - 1}) 3. Shotgun(${player.accuracy.shotgun.max}-${player.accuracy.shotgun.max + player.accuracy.shotgun.min - 1}) 4. Grenade(${player.accuracy.grenade.max}-${player.accuracy.grenade.max + player.accuracy.grenade.min - 1})`
      )
    );
    const choice = readlineSync.question("당신의 선택은? ");

    // 플레이어의 선택에 따라 다음 행동 처리
    // logs.push(chalk.green(`${choice}를 선택하셨습니다.`));
    switch (choice) {
      case "1":
        player.attack(monster);
        monster.attack(player);
        logs.push(
          chalk.yellow(
            `[${choice}] 몬스터에게 ${player.att}의 피해를 입혔습니다.`
          )
        );
        logs.push(
          chalk.red(`[${choice}] 몬스터가 ${monster.att}의 피해를 입혔습니다.`)
        );
        break;
      case "2":
        if (player.bullet.pistol > 0) {
          const damage = Math.floor(
            Math.random() * player.accuracy.pistol.min +
              player.accuracy.pistol.max
          );
          monster.hp -= damage;
          if (
            damage >
            (player.accuracy.pistol.min + player.accuracy.pistol.max - 1) * 0.8
          ) {
            logs.push(
              chalk.redBright(
                `[${choice}] **HEAD SHOT** ${damage}의 피해를 입혔습니다.`
              )
            );
          } else {
            logs.push(
              chalk.yellow(`[${choice}] ${damage}의 피해를 입혔습니다.`)
            );
          }
          player.bullet.pistol--;
        } else {
          logs.push(chalk.red(`탄약이 없습니다.`));
        }
        break;
      case "3":
        if (player.bullet.shotgun > 0) {
          for (let i = 0; i < 4; i++) {
            const damage = Math.floor(
              Math.random() * player.accuracy.shotgun.min +
                player.accuracy.shotgun.max
            );
            monster.hp -= damage;
            if (
              damage >
              (player.accuracy.shotgun.min + player.accuracy.shotgun.max - 1) *
                0.8
            ) {
              logs.push(
                chalk.redBright(
                  `[${choice}] **HEAD SHOT** ${damage}의 피해를 입혔습니다.`
                )
              );
            } else {
              logs.push(
                chalk.yellow(`[${choice}] ${damage}의 피해를 입혔습니다.`)
              );
            }
          }
          player.bullet.shotgun--;
        } else {
          logs.push(chalk.red(`탄약이 없습니다.`));
        }
        break;
      case "4":
        if (player.bullet.grenade > 0) {
          const damage = Math.floor(
            Math.random() * player.accuracy.grenade.min +
              player.accuracy.grenade.max
          );
          monster.hp -= damage;
          logs.push(
            chalk.redBright(
              `[${choice}] **BANG!!** ${damage}의 피해를 입혔습니다.`
            )
          );
          player.bullet.grenade--;
        } else {
          logs.push(chalk.red(`탄약이 없습니다.`));
        }
        break;
      default:
        logs.push(chalk.yellow(`다시 선택해주세요.`));
        break;
    }
  }

  return player.hp;
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10 && player.hp > 0) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);
    if (player.hp > 0) {
      player.hp += 30;
      const reward = () => {
        return Math.floor(Math.random() * 3);
      };
      const bulletType = reward();
      if (bulletType === 0) {
        player.bullet.pistol += 5;
      } else if (bulletType === 1) {
        player.bullet.shotgun += 3;
      } else {
        player.bullet.grenade += 1;
      }
      stage++;

      if (stage >= 3) {
        if (bulletType === 0) {
          player.accuracy.pistol.min += 2;
          player.accuracy.pistol.max += 2;
        } else if (bulletType === 1) {
          player.accuracy.shotgun.min += 2;
          player.accuracy.shotgun.max += 2;
        } else {
          player.accuracy.grenade.min += 5;
          player.accuracy.grenade.max += 5;
        }
      }
    } else {
      console.log(chalk.red(`****YOU DIED****\n`));
      break;
    }
    // 스테이지 클리어 및 게임 종료 조건
  }

  console.clear();
  console.log("YOU SAVED THE WORLD...");
}
