var PebbleHelper = (function () {
    return {
        COLOR_FALLBACK: function (platform) {
            return function(color, bw) {
                if (platform === "aplite" || platform === "diorite") return bw;
                return color;
            };
        },
        PBL_IF_ROUND_ELSE: function (platform) {
            return function(round, other) {
                if (platform === "chalk") return round;
                return other;
            };
        },
        PBL_DISPLAY_WIDTH: function (platform) {
            if (platform == "chalk") return 144;
            if (platform == "emery") return 200;
            return 144;
        },
        PBL_DISPLAY_HEIGHT: function (platform) {
            if (platform == "chalk") return 144;
            if (platform == "emery") return 228;
            return 168;
        }
    }

}());