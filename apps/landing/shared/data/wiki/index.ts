export type ArmorItem = {
  attribute: {
    name: string;
    icon?: string;
  };
  effects?: {
    effect_name: string;
    effect_level?: number;
    effect_duration?: number;
  };
  isNatural?: {
    populators?: {
      ore?: {
        name: string;
        icon: string;
      };
      height?: {
        min: number;
        max: number;
      };
      structory?: Array<string>;
      chance?: number;
      available_tools?: Array<string>;
    };
  };
  durability?: {
    helmet: {
      generic: number;
      points?: number;
    };
    chestplate: {
      generic: number;
      points?: number;
    };
    leggings: {
      generic: number;
      points?: number;
    };
    boots: {
      generic: number;
      points?: number;
    };
  };
  armor?: {
    helmet: {
      generic: number;
    };
    chestplate: {
      generic: number;
    };
    leggings: {
      generic: number;
    };
    boots: {
      generic: number;
    };
  };
  armorThougness?: {
    helmet: {
      generic: number;
    };
    chestplate: {
      generic: number;
    };
    leggings: {
      generic: number;
    };
    boots: {
      generic: number;
    };
  };
};

const ARMOR_FOLDER_ITEM = (name: string) => { return `/images/game-content/armor/${name}.png`}
const INGOT_FOLDER_ITEM = (name: string) => { return `/images/game-content/ingot/${name}.png`}
const BLOCK_FOLDER_iTEM = (name: string) => { return `/images/game-content/block/${name}.png`}

export const ARMORS: ArmorItem[] = [
  {
    attribute: {
      name: "Орихалковая",
      icon: ARMOR_FOLDER_ITEM("orichalcum_chest"),
    },
    effects: {
      effect_name: "везение II (если надета)",
    },
    durability: {
      helmet: {
        generic: 2907,
      },
      chestplate: {
        generic: 2910,
      },
      leggings: {
        generic: 2908,
      },
      boots: {
        generic: 2909,
      },
    },
    armor: {
      helmet: {
        generic: 4,
      },
      chestplate: {
        generic: 6,
      },
      leggings: {
        generic: 5,
      },
      boots: {
        generic: 4,
      },
    },
    armorThougness: {
      helmet: {
        generic: 2,
      },
      chestplate: {
        generic: 6,
      },
      leggings: {
        generic: 4,
      },
      boots: {
        generic: 4,
      },
    },
  },
  {
    attribute: {
      name: "Адамантитовая",
      icon: INGOT_FOLDER_ITEM("adamantite_bar")
    },
    effects: {
      effect_name: "прочнейшая броня",
    },
    isNatural: {
      populators: {
        ore: {
          name: "Адамантитовая",
          icon: BLOCK_FOLDER_iTEM("adamantite"),
        },
        height: {
          min: -60,
          max: 45,
        },
        structory: ["везде"],
        chance: 32,
        available_tools: [
          "алмазная кирка",
          "незеритовая кирка",
          "адамантитовая кирка",
          "кобальтовая кирка",
          "платиновая кирка",
        ],
      },
    },
    durability: {
      helmet: {
        generic: 3707,
      },
      chestplate: {
        generic: 3710,
      },
      leggings: {
        generic: 3708,
      },
      boots: {
        generic: 3709,
      },
    },
    armor: {
      helmet: {
        generic: 5,
      },
      chestplate: {
        generic: 8,
      },
      leggings: {
        generic: 4,
      },
      boots: {
        generic: 2,
      },
    },
    armorThougness: {
      helmet: {
        generic: 2,
      },
      chestplate: {
        generic: 6,
      },
      leggings: {
        generic: 4,
      },
      boots: {
        generic: 2,
      },
    },
  },
  {
    attribute: {
      name: "Кобальтовая",
      icon: INGOT_FOLDER_ITEM("cobalt_bar"),
    },
    // recipe: {
    //   helmet: {
    //     name: "Шлем",
    //     recipe_material: "кобальтовый слиток",
    //     recipe_icon:
    //       "https://cdn.discordapp.com/attachments/904344676587417621/1198924492567752764/Screenshot_5.png?ex=65c0ac71&is=65ae3771&hm=c377c1e675c04e01f1423506acfe1705aa1d7f7381f85fae906be9345329bee6&",
    //   },
    //   chestplate: {
    //     name: "Нагрудник",
    //     recipe_material: "кобальтовый слиток",
    //     recipe_icon:
    //       "https://cdn.discordapp.com/attachments/904344676587417621/1198924492865536140/Screenshot_6.png?ex=65c0ac72&is=65ae3772&hm=6d3ae49c2a57121067e3cc0469bccb5aa5fef6ea8a4a95d61fe9f758f258559e&",
    //   },
    //   leggings: {
    //     name: "Поножи",
    //     recipe_material: "кобальтовый слиток",
    //     recipe_icon:
    //       "https://cdn.discordapp.com/attachments/904344676587417621/1198924493113004062/Screenshot_7.png?ex=65c0ac72&is=65ae3772&hm=79a22fb34abda106fd756e69bca2ab2c565721a922b4c2c62d576bddf81ff567&",
    //   },
    //   boots: {
    //     name: "Ботинки",
    //     recipe_material: "кобальтовый слиток",
    //     recipe_icon:
    //       "https://cdn.discordapp.com/attachments/904344676587417621/1198924493364670555/Screenshot_8.png?ex=65c0ac72&is=65ae3772&hm=b58e4025602da0399e1ac5b12fbafe1f9df2c2793b20149d9726a4210877279d&",
    //   },
    // },
    effects: {
      effect_name: "скорость II (10 минут) (если надета)",
    },
    isNatural: {
      populators: {
        ore: {
          name: "Кобальтовая",
          icon: BLOCK_FOLDER_iTEM("cobalt"),
        },
        height: {
          min: -60,
          max: 35,
        },
        structory: ["везде"],
        chance: 32,
        available_tools: [
          "алмазная кирка",
          "незеритовая кирка",
          "адамантитовая кирка",
          "кобальтовая кирка",
          "платиновая кирка",
          "астральная кирка",
        ],
      },
    },
    durability: {
      helmet: {
        generic: 3007,
      },
      chestplate: {
        generic: 3010,
      },
      leggings: {
        generic: 3008,
      },
      boots: {
        generic: 3009,
      },
    },
    armor: {
      helmet: {
        generic: 2,
      },
      chestplate: {
        generic: 6,
      },
      leggings: {
        generic: 5,
      },
      boots: {
        generic: 2,
      },
    },
    armorThougness: {
      helmet: {
        generic: 2,
      },
      chestplate: {
        generic: 4,
      },
      leggings: {
        generic: 2,
      },
      boots: {
        generic: 2,
      },
    },
  },
  {
    attribute: {
      name: "Платиновая",
      icon: INGOT_FOLDER_ITEM("platinum_bar")
    },
    // recipe: {
    //   helmet: {
    //     name: "Шлем",
    //     recipe_material: "платиновый слиток",
    //     recipe_icon:
    //       "https://cdn.discordapp.com/attachments/904344676587417621/1198924523374907514/Screenshot_9.png?ex=65c0ac79&is=65ae3779&hm=546af93ad024aeba773369c65672f266c7b547b8055197a4d190a730691bf4ca&",
    //   },
    //   chestplate: {
    //     name: "Нагрудник",
    //     recipe_material: "платиновый слиток",
    //     recipe_icon:
    //       "https://cdn.discordapp.com/attachments/904344676587417621/1198924523655934022/Screenshot_10.png?ex=65c0ac79&is=65ae3779&hm=cdcde6ca098da72bc34fd6e8356b016c050dbf52a64308023b0b2dda62f9f1cc&",
    //   },
    //   leggings: {
    //     name: "Поножи",
    //     recipe_material: "платиновый слиток",
    //     recipe_icon:
    //       "https://cdn.discordapp.com/attachments/904344676587417621/1198924523983077416/Screenshot_11.png?ex=65c0ac79&is=65ae3779&hm=4c71f891ac791b1a524ffd5bdb4348e7fe0bcf6093f5156b272cd2dc3dc19311&",
    //   },
    //   boots: {
    //     name: "Ботинки",
    //     recipe_material: "платиновый слиток",
    //     recipe_icon:
    //       "https://cdn.discordapp.com/attachments/904344676587417621/1198924524431880302/Screenshot_12.png?ex=65c0ac79&is=65ae3779&hm=d0199eea00d5ae81f2396c5f978ba3d98f51bf046098e45bc1b131fbc05346ef&",
    //   },
    // },
    effects: {
      effect_name: "лучшая защита",
    },
    isNatural: {
      populators: {
        ore: {
          name: "Платиновая",
          icon: BLOCK_FOLDER_iTEM("platinum"),
        },
        height: {
          min: -60,
          max: 45,
        },
        structory: ["везде"],
        chance: 20,
        available_tools: [
          "алмазная кирка",
          "незеритовая кирка",
          "адамантитовая кирка",
          "кобальтовая кирка",
          "платиновая кирка",
          "ледяная кирка",
          "астральная кирка",
        ],
      },
    },
    durability: {
      helmet: {
        generic: 1408,
      },
      chestplate: {
        generic: 1410,
      },
      leggings: {
        generic: 1408,
      },
      boots: {
        generic: 1409,
      },
    },
    armor: {
      helmet: {
        generic: 5,
      },
      chestplate: {
        generic: 10,
      },
      leggings: {
        generic: 5,
      },
      boots: {
        generic: 2,
      },
    },
    armorThougness: {
      helmet: {
        generic: 4,
      },
      chestplate: {
        generic: 6,
      },
      leggings: {
        generic: 4,
      },
      boots: {
        generic: 2,
      },
    },
  },
  {
    attribute: {
      name: "Ледяная",
      icon: INGOT_FOLDER_ITEM("ice_bar")
    },
    // recipe: {
    //   helmet: {
    //     name: "Шлем",
    //     recipe_material: "ледяной слиток",
    //     recipe_icon:
    //       "https://cdn.discordapp.com/attachments/904344676587417621/1198924524842913863/Screenshot_13.png?ex=65c0ac79&is=65ae3779&hm=f2f8db2a1df17c861380edc4c9ed89f8fc7e5ed954b6fcf6fc68fe9c95268148&",
    //   },
    //   chestplate: {
    //     name: "Нагрудник",
    //     recipe_material: "ледяной слиток",
    //     recipe_icon:
    //       "https://cdn.discordapp.com/attachments/904344676587417621/1198924525182648400/Screenshot_14.png?ex=65c0ac79&is=65ae3779&hm=4dcb62ce4e47e46b0243bcee5feca09b759eb8e0b6d489a1c5322f668efd969a&",
    //   },
    //   leggings: {
    //     name: "Поножи",
    //     recipe_material: "ледяной слиток",
    //     recipe_icon:
    //       "https://cdn.discordapp.com/attachments/904344676587417621/1198924525568528404/Screenshot_16.png?ex=65c0ac79&is=65ae3779&hm=e38d7897bd614614fc09b03f73c4605bdac517d09136975d503310f0bc9699f7&",
    //   },
    //   boots: {
    //     name: "Ботинки",
    //     recipe_material: "ледяной слиток",
    //     recipe_icon:
    //       "https://cdn.discordapp.com/attachments/904344676587417621/1198924525849555034/Screenshot_17.png?ex=65c0ac79&is=65ae3779&hm=179c55f5226cbd68bed5ab845debc5588ca8381e0460b1dbc85978a914064dcf&",
    //   },
    // },
    effects: {
      effect_name: "ледоход II (если надета)",
    },
    isNatural: {
      populators: {
        ore: {
          name: "Ледяная",
          icon: BLOCK_FOLDER_iTEM("ice"),
        },
        height: {
          min: -20,
          max: 190,
        },
        structory: [
          "все ванильные зимние биомы",
          "Terralith: snowy_shield",
          "Terralith: snowy_maple_forest",
          "Terralith: snowy_cherry_grove",
          "Terralith: snowy_badlands",
          "Terralith: frozen_cliffs",
          "Terralith: rocky_mountains",
          "Terralith: ice_spikes",
          "Terralith: grove",
          "Terralith: taiga",
          "Terralith: frozen_peaks",
          "Terralith: snowy_taiga",
          "Terralith: wintry_forest",
          "Terralith: snowy_slopes",
        ],
        chance: 70,
        available_tools: [
          "деревянная кирка",
          "золотая кирка",
          "железная кирка",
          "алмазная кирка",
          "незеритовая кирка",
          "адамантитовая кирка",
          "кобальтовая кирка",
          "платиновая кирка",
          "астральная кирка",
          "ледяная кирка",
        ],
      },
    },
    durability: {
      helmet: {
        generic: 308,
      },
      chestplate: {
        generic: 310,
      },
      leggings: {
        generic: 308,
      },
      boots: {
        generic: 309,
      },
    },
    armor: {
      helmet: {
        generic: 3,
      },
      chestplate: {
        generic: 7,
      },
      leggings: {
        generic: 5,
      },
      boots: {
        generic: 3,
      },
    },
    armorThougness: {
      helmet: {
        generic: 1,
      },
      chestplate: {
        generic: 1,
      },
      leggings: {
        generic: 1,
      },
      boots: {
        generic: 1,
      },
    },
  },
];