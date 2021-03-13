function nextTurn(player, type, settings, storage) {
	// * should be stable
	switch (type) {
		case "normal":
			if (settings.reverse) {
				if (player - 1 < 0) {
					return storage.users.length - 1;
				} else {
					return player - 1;
				}
			} else if (player + 1 >= storage.users.length) {
				return 0;
			} else {
				return player + 1;
			}
		case "skip":
			if (settings.reverse) {
				if (storage.users.length == 2) {
					return player;
				} else {
					if (player - 2 == 0) {
						return 0;
					} else if (player - 2 == -1) {
						return storage.users.length - 1;
					} else if (player - 2 == -2) {
						return storage.users.length - 2;
					} else {
						return player - 2;
					}
				}
			} else {
				if (storage.users.length == 2) {
					return player;
				} else {
					if (player + 2 == storage.users.length) {
						return 0;
					} else if (player + 2 > storage.users.length) {
						return 1;
					} else if (player == 0 && storage.users.length >= 3) {
						return 2;
					}
					// else if (player - 2 < 0) {
					// 	return storage.users.length - 2;
					// }
					else {
						return player + 2;
					}
				}
			}
	}
}

let settings = {
    reverse :true
}

let storage = {
    users: {
        length:10
    }
}
console.log(nextTurn(),"normal", settings, storage);