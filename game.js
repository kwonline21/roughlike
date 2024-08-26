import chalk from "chalk";
import readlineSync from "readline-sync";

class Player {
  constructor() {
    this.hp = 100;
    this.att = 25;
    this.guns = {
      pistol: 0,
      shotgun: 0,
      grenade: 0,
    };
  }

  attack(monster) {
    // 플레이어의 공격
    monster.hp -= this.att;
  }

  usePistol(monster) {
    monster.hp -= 30;
  }

  useShotgun(monster) {
    monster.hp -= 50;
  }

  useGrenade(monster) {
    monster.hp -= 100;
  }
}

class Monster {
  constructor(stage) {
    if (stage === 1) {
      this.hp = 100;
      this.att = 2.5;
    } else if (stage > 1) {
      this.hp = 100 + stage * 7;
      this.att = 2.5 + stage * 3;
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
      `| Knife: 1, Pistol: ${player.guns.pistol}, Shotgun: ${player.guns.shotgun}, Grenade: ${player.guns.grenade} |`
    )
  );
  console.log(chalk.magentaBright(`======================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  if (stage > 1) {
    logs.push(chalk.green(`체력이 30 회복되었습니다!`));
    logs.push(chalk.green(`탄약을 획득했습니다!`));
  }

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(chalk.green(`\n1. Knife 2. Pistol 3. Shotgun 4. Grenade`));
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
        if (player.guns.pistol > 0) {
          player.usePistol(monster);
          logs.push(chalk.yellow(`[${choice}] 30의 피해를 입혔습니다.`));
          player.guns.pistol--;
        } else {
          logs.push(chalk.red(`탄약이 없습니다.`));
        }
        break;
      case "3":
        if (player.guns.shotgun > 0) {
          player.useShotgun(monster);
          logs.push(chalk.yellow(`[${choice}] 50의 피해를 입혔습니다.`));
          player.guns.shotgun--;
        } else {
          logs.push(chalk.red(`탄약이 없습니다.`));
        }
        break;
      case "4":
        if (player.guns.grenade > 0) {
          player.useGrenade(monster);
          logs.push(chalk.yellow(`[${choice}] 100의 피해를 입혔습니다.`));
          player.guns.grenade--;
        } else {
          logs.push(chalk.yellow(`수류탄이 없습니다.`));
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
      const compensation = () => {
        return Math.floor(Math.random() * 3);
      };
      const bulletType = compensation();
      if (bulletType === 0) {
        player.guns.pistol += 5;
      } else if (bulletType === 1) {
        player.guns.shotgun += 3;
      } else {
        player.guns.grenade += 1;
      }
      stage++;
    } else {
      console.log(chalk.red(`****YOU DIED****\n`));
      break;
    }
    // 스테이지 클리어 및 게임 종료 조건
  }
}
