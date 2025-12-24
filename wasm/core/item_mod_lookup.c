#include "item_mod_lookup.h"

// Lookup tables: item -> allowed modifier IDs

// Bows - normal_prefixes
uint16_t bows_normal_prefixes[8] = {
    1220, 1221, 1222, 1223, 353, 354, 1297, 356
};

// Bows - normal_suffixes
uint16_t bows_normal_suffixes[13] = {
    1302, 1168, 1313, 1241, 1242, 1243, 1244, 1036, 1037, 368, 1038, 1173, 237
};

// Bows - desecrated_prefixes
uint16_t bows_desecrated_prefixes[7] = {
    334, 335, 336, 337, 206, 339, 340
};

// Bows - desecrated_suffixes
uint16_t bows_desecrated_suffixes[8] = {
    341, 342, 1134, 344, 1139, 653, 654, 342
};

// Bows - essence_prefixes
uint16_t bows_essence_prefixes[9] = {
    373, 374, 375, 376, 1051, 378, 379, 380, 381
};

// Bows - essence_suffixes
uint16_t bows_essence_suffixes[7] = {
    382, 1326, 1327, 1328, 386, 387, 388
};

// Crossbows - normal_prefixes
uint16_t crossbows_normal_prefixes[8] = {
    1220, 1221, 1222, 1223, 353, 354, 1297, 356
};

// Crossbows - normal_suffixes
uint16_t crossbows_normal_suffixes[14] = {
    1301, 1302, 1168, 1313, 1241, 1242, 1243, 1244, 1036, 1037, 368, 1038, 1173, 185
};

// Crossbows - desecrated_prefixes
uint16_t crossbows_desecrated_prefixes[6] = {
    151, 152, 336, 339, 340, 155
};

// Crossbows - desecrated_suffixes
uint16_t crossbows_desecrated_suffixes[7] = {
    157, 1134, 159, 160, 1139, 162, 653
};

// Crossbows - essence_prefixes
uint16_t crossbows_essence_prefixes[9] = {
    373, 374, 375, 376, 1051, 378, 379, 380, 381
};

// Crossbows - essence_suffixes
uint16_t crossbows_essence_suffixes[7] = {
    382, 1326, 1327, 1328, 386, 387, 388
};

// Quivers - normal_prefixes
uint16_t quivers_normal_prefixes[7] = {
    1220, 1221, 1222, 1223, 1297, 660, 661
};

// Quivers - normal_suffixes
uint16_t quivers_normal_suffixes[8] = {
    1302, 1313, 1243, 1244, 1037, 667, 1318, 669
};

// Quivers - desecrated_prefixes
uint16_t quivers_desecrated_prefixes[1] = {
    651
};

// Quivers - desecrated_suffixes
uint16_t quivers_desecrated_suffixes[3] = {
    1139, 653, 654
};

// Quivers - essence_prefixes
uint16_t quivers_essence_prefixes[2] = {
    1051, 671
};

// Quivers - essence_suffixes
uint16_t quivers_essence_suffixes[1] = {
    1327
};

// OneHand_Maces - normal_prefixes
uint16_t onehand_maces_normal_prefixes[8] = {
    1220, 1221, 1222, 1223, 353, 354, 1297, 356
};

// OneHand_Maces - normal_suffixes
uint16_t onehand_maces_normal_suffixes[14] = {
    1301, 1168, 1312, 1241, 1242, 1243, 1244, 1036, 1037, 368, 1038, 1173, 371, 372
};

// OneHand_Maces - desecrated_prefixes
uint16_t onehand_maces_desecrated_prefixes[8] = {
    254, 336, 339, 257, 258, 259, 260, 340
};

// OneHand_Maces - desecrated_suffixes
uint16_t onehand_maces_desecrated_suffixes[8] = {
    262, 1134, 264, 265, 1139, 267, 268, 653
};

// OneHand_Maces - essence_prefixes
uint16_t onehand_maces_essence_prefixes[9] = {
    373, 374, 375, 376, 1051, 378, 379, 380, 381
};

// OneHand_Maces - essence_suffixes
uint16_t onehand_maces_essence_suffixes[7] = {
    382, 1326, 1327, 1328, 386, 387, 388
};

// Amulets - normal_prefixes
uint16_t amulets_normal_prefixes[10] = {
    1291, 1292, 1293, 1294, 1295, 1296, 1297, 1298, 1299, 1300
};

// Amulets - normal_suffixes
uint16_t amulets_normal_suffixes[21] = {
    1301, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1310, 1311, 1312, 1313, 1314, 1315, 1316, 1317, 1318, 1319, 1320, 1321
};

// Amulets - desecrated_prefixes
uint16_t amulets_desecrated_prefixes[11] = {
    1260, 1261, 1262, 1263, 1264, 1265, 1266, 1267, 1268, 1269, 1270
};

// Amulets - desecrated_suffixes
uint16_t amulets_desecrated_suffixes[19] = {
    1271, 1272, 1273, 1274, 1275, 1276, 1277, 1278, 1279, 1280, 1281, 1283, 1284, 1285, 1286, 1287, 1288, 1289, 1290
};

// Amulets - essence_prefixes
uint16_t amulets_essence_prefixes[3] = {
    1322, 1323, 1324
};

// Amulets - essence_suffixes
uint16_t amulets_essence_suffixes[12] = {
    1325, 1326, 1327, 1328, 1329, 1330, 1331, 1332, 1333, 1334, 1335, 1336
};

// Spears - normal_prefixes
uint16_t spears_normal_prefixes[8] = {
    1220, 1221, 1222, 1223, 353, 354, 1297, 356
};

// Spears - normal_suffixes
uint16_t spears_normal_suffixes[16] = {
    1301, 1302, 1168, 1312, 1313, 1241, 1242, 1243, 1244, 1036, 1037, 368, 1038, 1173, 371, 372
};

// Spears - desecrated_prefixes
uint16_t spears_desecrated_prefixes[6] = {
    334, 335, 336, 337, 339, 340
};

// Spears - desecrated_suffixes
uint16_t spears_desecrated_suffixes[8] = {
    341, 342, 1134, 344, 1139, 653, 654, 342
};

// Spears - essence_prefixes
uint16_t spears_essence_prefixes[9] = {
    373, 374, 375, 376, 1051, 378, 379, 380, 381
};

// Spears - essence_suffixes
uint16_t spears_essence_suffixes[7] = {
    382, 1326, 1327, 1328, 386, 387, 388
};

// Shields_str_int - normal_prefixes
uint16_t shields_str_int_normal_prefixes[6] = {
    1291, 1010, 1013, 758, 884, 625
};

// Shields_str_int - normal_suffixes
uint16_t shields_str_int_normal_suffixes[16] = {
    1301, 1303, 1305, 1306, 1307, 1309, 1168, 894, 527, 633, 634, 635, 636, 637, 1176, 1174
};

// Shields_str_int - desecrated_suffixes
uint16_t shields_str_int_desecrated_suffixes[19] = {
    1271, 1272, 492, 493, 612, 1131, 862, 1275, 866, 499, 1137, 1282, 1281, 867, 1288, 505, 618, 507, 619
};

// Shields_str_int - essence_prefixes
uint16_t shields_str_int_essence_prefixes[3] = {
    1322, 1183, 643
};

// Shields_str_int - essence_suffixes
uint16_t shields_str_int_essence_suffixes[6] = {
    1325, 1326, 1328, 1333, 1334, 1335
};

// Shields_str - normal_prefixes
uint16_t shields_str_normal_prefixes[6] = {
    1291, 1083, 1294, 698, 884, 625
};

// Shields_str - normal_suffixes
uint16_t shields_str_normal_suffixes[14] = {
    1301, 1305, 1306, 1307, 1309, 1168, 894, 527, 633, 634, 635, 636, 637, 1174
};

// Shields_str - desecrated_suffixes
uint16_t shields_str_desecrated_suffixes[19] = {
    1271, 1272, 492, 493, 612, 1131, 862, 1275, 866, 499, 1137, 1282, 1281, 867, 1288, 505, 618, 507, 619
};

// Shields_str - essence_prefixes
uint16_t shields_str_essence_prefixes[3] = {
    1322, 1179, 643
};

// Shields_str - essence_suffixes
uint16_t shields_str_essence_suffixes[5] = {
    1325, 1326, 1333, 1334, 1335
};

// Shields_str_dex - normal_prefixes
uint16_t shields_str_dex_normal_prefixes[6] = {
    1291, 1009, 1012, 757, 884, 625
};

// Shields_str_dex - normal_suffixes
uint16_t shields_str_dex_normal_suffixes[15] = {
    1301, 1302, 1305, 1306, 1307, 1309, 1168, 894, 527, 633, 634, 635, 636, 637, 1174
};

// Shields_str_dex - desecrated_suffixes
uint16_t shields_str_dex_desecrated_suffixes[19] = {
    1271, 1272, 492, 493, 612, 1131, 862, 1275, 866, 499, 1137, 1282, 1281, 867, 1288, 505, 618, 507, 619
};

// Shields_str_dex - essence_prefixes
uint16_t shields_str_dex_essence_prefixes[3] = {
    1322, 1182, 643
};

// Shields_str_dex - essence_suffixes
uint16_t shields_str_dex_essence_suffixes[6] = {
    1325, 1326, 1327, 1333, 1334, 1335
};

// TwoHand_Maces - normal_prefixes
uint16_t twohand_maces_normal_prefixes[8] = {
    1220, 1221, 1222, 1223, 353, 354, 1297, 356
};

// TwoHand_Maces - normal_suffixes
uint16_t twohand_maces_normal_suffixes[14] = {
    1301, 1168, 1312, 1241, 1242, 1243, 1244, 1036, 1037, 368, 1038, 1173, 371, 372
};

// TwoHand_Maces - desecrated_prefixes
uint16_t twohand_maces_desecrated_prefixes[8] = {
    254, 336, 339, 257, 258, 259, 260, 340
};

// TwoHand_Maces - desecrated_suffixes
uint16_t twohand_maces_desecrated_suffixes[8] = {
    262, 1134, 264, 265, 1139, 267, 268, 653
};

// TwoHand_Maces - essence_prefixes
uint16_t twohand_maces_essence_prefixes[9] = {
    373, 374, 375, 376, 1051, 378, 379, 380, 381
};

// TwoHand_Maces - essence_suffixes
uint16_t twohand_maces_essence_suffixes[7] = {
    382, 1326, 1327, 1328, 386, 387, 388
};

// Helmets_str_int - normal_prefixes
uint16_t helmets_str_int_normal_prefixes[8] = {
    1291, 1292, 1148, 1151, 1154, 1157, 1297, 1298
};

// Helmets_str_int - normal_suffixes
uint16_t helmets_str_int_normal_suffixes[14] = {
    1301, 1303, 1305, 1306, 1307, 1309, 1168, 1311, 1314, 1317, 1319, 1173, 1176, 1174
};

// Helmets_str_int - desecrated_suffixes
uint16_t helmets_str_int_desecrated_suffixes[15] = {
    1275, 1271, 1272, 1131, 1132, 1133, 1134, 1281, 1282, 1137, 1138, 1139, 1144, 1288, 1141
};

// Helmets_str_int - essence_prefixes
uint16_t helmets_str_int_essence_prefixes[3] = {
    1322, 1323, 1183
};

// Helmets_str_int - essence_suffixes
uint16_t helmets_str_int_essence_suffixes[9] = {
    1325, 1326, 1328, 1189, 1333, 1334, 1192, 1335, 1336
};

// Helmets_int - normal_prefixes
uint16_t helmets_int_normal_prefixes[8] = {
    1291, 1292, 1293, 1296, 1091, 1094, 1297, 1298
};

// Helmets_int - normal_suffixes
uint16_t helmets_int_normal_suffixes[12] = {
    1303, 1305, 1306, 1307, 1309, 1168, 1311, 1314, 1317, 1319, 1173, 1176
};

// Helmets_int - desecrated_suffixes
uint16_t helmets_int_desecrated_suffixes[12] = {
    1275, 1271, 1272, 1133, 1134, 1281, 1282, 1138, 1139, 1144, 1288, 1141
};

// Helmets_int - essence_prefixes
uint16_t helmets_int_essence_prefixes[3] = {
    1322, 1323, 1181
};

// Helmets_int - essence_suffixes
uint16_t helmets_int_essence_suffixes[8] = {
    1325, 1328, 1189, 1333, 1334, 1192, 1335, 1336
};

// Helmets_dex_int - normal_prefixes
uint16_t helmets_dex_int_normal_prefixes[8] = {
    1291, 1292, 1149, 1152, 1155, 1158, 1297, 1298
};

// Helmets_dex_int - normal_suffixes
uint16_t helmets_dex_int_normal_suffixes[14] = {
    1302, 1303, 1305, 1306, 1307, 1309, 1168, 1311, 1314, 1317, 1319, 1173, 1176, 1175
};

// Helmets_dex_int - desecrated_suffixes
uint16_t helmets_dex_int_desecrated_suffixes[14] = {
    1275, 1271, 1272, 1133, 1134, 1281, 1282, 1138, 1139, 1144, 1288, 1142, 1141, 1143
};

// Helmets_dex_int - essence_prefixes
uint16_t helmets_dex_int_essence_prefixes[3] = {
    1322, 1323, 1184
};

// Helmets_dex_int - essence_suffixes
uint16_t helmets_dex_int_essence_suffixes[9] = {
    1325, 1327, 1328, 1189, 1333, 1334, 1192, 1335, 1336
};

// Helmets_str - normal_prefixes
uint16_t helmets_str_normal_prefixes[8] = {
    1291, 1292, 1083, 1294, 1089, 1092, 1297, 1298
};

// Helmets_str - normal_suffixes
uint16_t helmets_str_normal_suffixes[13] = {
    1301, 1302, 1305, 1306, 1307, 1309, 1168, 1311, 1314, 1317, 1319, 1173, 1174
};

// Helmets_str - desecrated_suffixes
uint16_t helmets_str_desecrated_suffixes[14] = {
    1275, 1271, 1272, 1131, 1132, 1133, 1134, 1281, 1282, 1137, 1138, 1139, 1288, 1141
};

// Helmets_str - essence_prefixes
uint16_t helmets_str_essence_prefixes[3] = {
    1322, 1323, 1179
};

// Helmets_str - essence_suffixes
uint16_t helmets_str_essence_suffixes[9] = {
    1325, 1326, 1328, 1189, 1333, 1334, 1192, 1335, 1336
};

// Helmets_dex - normal_prefixes
uint16_t helmets_dex_normal_prefixes[8] = {
    1291, 1292, 1219, 1295, 1090, 1093, 1297, 1298
};

// Helmets_dex - normal_suffixes
uint16_t helmets_dex_normal_suffixes[13] = {
    1302, 1303, 1305, 1306, 1307, 1309, 1168, 1311, 1314, 1317, 1319, 1173, 1175
};

// Helmets_dex - desecrated_suffixes
uint16_t helmets_dex_desecrated_suffixes[13] = {
    1275, 1271, 1272, 1133, 1134, 1281, 1282, 1138, 1139, 1288, 1142, 1141, 1143
};

// Helmets_dex - essence_prefixes
uint16_t helmets_dex_essence_prefixes[3] = {
    1322, 1323, 1180
};

// Helmets_dex - essence_suffixes
uint16_t helmets_dex_essence_suffixes[9] = {
    1325, 1327, 1328, 1189, 1333, 1334, 1192, 1335, 1336
};

// Helmets_str_dex - normal_prefixes
uint16_t helmets_str_dex_normal_prefixes[8] = {
    1291, 1292, 1147, 1150, 1153, 1156, 1297, 1298
};

// Helmets_str_dex - normal_suffixes
uint16_t helmets_str_dex_normal_suffixes[14] = {
    1301, 1302, 1305, 1306, 1307, 1309, 1168, 1311, 1314, 1317, 1319, 1173, 1174, 1175
};

// Helmets_str_dex - desecrated_suffixes
uint16_t helmets_str_dex_desecrated_suffixes[16] = {
    1275, 1271, 1272, 1131, 1132, 1133, 1134, 1281, 1282, 1137, 1138, 1139, 1288, 1142, 1141, 1143
};

// Helmets_str_dex - essence_prefixes
uint16_t helmets_str_dex_essence_prefixes[3] = {
    1322, 1323, 1182
};

// Helmets_str_dex - essence_suffixes
uint16_t helmets_str_dex_essence_suffixes[10] = {
    1325, 1326, 1327, 1328, 1189, 1333, 1334, 1192, 1335, 1336
};

// Sceptres - normal_prefixes
uint16_t sceptres_normal_prefixes[8] = {
    568, 309, 310, 311, 312, 313, 314, 315
};

// Sceptres - normal_suffixes
uint16_t sceptres_normal_suffixes[13] = {
    1301, 1303, 318, 1168, 320, 321, 322, 323, 324, 325, 1247, 327, 328
};

// Sceptres - essence_prefixes
uint16_t sceptres_essence_prefixes[1] = {
    329
};

// Sceptres - essence_suffixes
uint16_t sceptres_essence_suffixes[4] = {
    1326, 1327, 1328, 333
};

// Boots_str_int - normal_prefixes
uint16_t boots_str_int_normal_prefixes[6] = {
    1291, 1292, 1010, 1013, 758, 760
};

// Boots_str_int - normal_suffixes
uint16_t boots_str_int_normal_suffixes[15] = {
    1301, 1303, 1305, 1306, 1307, 1309, 1168, 894, 1314, 1319, 772, 773, 774, 1174, 1176
};

// Boots_str_int - desecrated_suffixes
uint16_t boots_str_int_desecrated_suffixes[15] = {
    1275, 1271, 1272, 737, 738, 739, 1281, 1282, 742, 743, 744, 745, 1288, 747, 748
};

// Boots_str_int - essence_prefixes
uint16_t boots_str_int_essence_prefixes[4] = {
    1322, 1323, 1183, 786
};

// Boots_str_int - essence_suffixes
uint16_t boots_str_int_essence_suffixes[8] = {
    1325, 1326, 1328, 1057, 1333, 1334, 1335, 1336
};

// Boots_str - normal_prefixes
uint16_t boots_str_normal_prefixes[6] = {
    1291, 1292, 1083, 1294, 698, 760
};

// Boots_str - normal_suffixes
uint16_t boots_str_normal_suffixes[13] = {
    1301, 1305, 1306, 1307, 1309, 1168, 894, 1314, 1319, 772, 773, 774, 1174
};

// Boots_str - desecrated_suffixes
uint16_t boots_str_desecrated_suffixes[15] = {
    1275, 1271, 1272, 737, 738, 739, 1281, 1282, 742, 743, 744, 745, 1288, 747, 748
};

// Boots_str - essence_prefixes
uint16_t boots_str_essence_prefixes[4] = {
    1322, 1323, 1179, 786
};

// Boots_str - essence_suffixes
uint16_t boots_str_essence_suffixes[7] = {
    1325, 1326, 1057, 1333, 1334, 1335, 1336
};

// Boots_int - normal_prefixes
uint16_t boots_int_normal_prefixes[6] = {
    1291, 1292, 1293, 1296, 700, 760
};

// Boots_int - normal_suffixes
uint16_t boots_int_normal_suffixes[13] = {
    1303, 1305, 1306, 1307, 1309, 1168, 894, 1314, 1319, 772, 773, 774, 1176
};

// Boots_int - desecrated_suffixes
uint16_t boots_int_desecrated_suffixes[15] = {
    1275, 1271, 1272, 737, 738, 739, 1281, 1282, 742, 743, 744, 745, 1288, 747, 748
};

// Boots_int - essence_prefixes
uint16_t boots_int_essence_prefixes[4] = {
    1322, 1323, 1181, 786
};

// Boots_int - essence_suffixes
uint16_t boots_int_essence_suffixes[7] = {
    1325, 1328, 1057, 1333, 1334, 1335, 1336
};

// Boots_dex - normal_prefixes
uint16_t boots_dex_normal_prefixes[6] = {
    1291, 1292, 1219, 1295, 699, 760
};

// Boots_dex - normal_suffixes
uint16_t boots_dex_normal_suffixes[13] = {
    1302, 1305, 1306, 1307, 1309, 1168, 894, 1314, 1319, 772, 773, 774, 1175
};

// Boots_dex - desecrated_suffixes
uint16_t boots_dex_desecrated_suffixes[15] = {
    1275, 1271, 1272, 737, 738, 739, 1281, 1282, 742, 743, 744, 745, 1288, 747, 748
};

// Boots_dex - essence_prefixes
uint16_t boots_dex_essence_prefixes[4] = {
    1322, 1323, 1180, 786
};

// Boots_dex - essence_suffixes
uint16_t boots_dex_essence_suffixes[7] = {
    1325, 1327, 1057, 1333, 1334, 1335, 1336
};

// Boots_dex_int - normal_prefixes
uint16_t boots_dex_int_normal_prefixes[6] = {
    1291, 1292, 1011, 1014, 759, 760
};

// Boots_dex_int - normal_suffixes
uint16_t boots_dex_int_normal_suffixes[15] = {
    1302, 1303, 1305, 1306, 1307, 1309, 1168, 894, 1314, 1319, 772, 773, 774, 1176, 1175
};

// Boots_dex_int - desecrated_suffixes
uint16_t boots_dex_int_desecrated_suffixes[15] = {
    1275, 1271, 1272, 737, 738, 739, 1281, 1282, 742, 743, 744, 745, 1288, 747, 748
};

// Boots_dex_int - essence_prefixes
uint16_t boots_dex_int_essence_prefixes[4] = {
    1322, 1323, 1184, 786
};

// Boots_dex_int - essence_suffixes
uint16_t boots_dex_int_essence_suffixes[8] = {
    1325, 1327, 1328, 1057, 1333, 1334, 1335, 1336
};

// Boots_str_dex - normal_prefixes
uint16_t boots_str_dex_normal_prefixes[6] = {
    1291, 1292, 1009, 1012, 757, 760
};

// Boots_str_dex - normal_suffixes
uint16_t boots_str_dex_normal_suffixes[15] = {
    1301, 1302, 1305, 1306, 1307, 1309, 1168, 894, 1314, 1319, 772, 773, 774, 1174, 1175
};

// Boots_str_dex - desecrated_suffixes
uint16_t boots_str_dex_desecrated_suffixes[15] = {
    1275, 1271, 1272, 737, 738, 739, 1281, 1282, 742, 743, 744, 745, 1288, 747, 748
};

// Boots_str_dex - essence_prefixes
uint16_t boots_str_dex_essence_prefixes[4] = {
    1322, 1323, 1182, 786
};

// Boots_str_dex - essence_suffixes
uint16_t boots_str_dex_essence_suffixes[8] = {
    1325, 1326, 1327, 1057, 1333, 1334, 1335, 1336
};

// Rings - normal_prefixes
uint16_t rings_normal_prefixes[13] = {
    1291, 1292, 1219, 1220, 1221, 1222, 1223, 1297, 1298, 1226, 1227, 1228, 1229
};

// Rings - normal_suffixes
uint16_t rings_normal_suffixes[18] = {
    1301, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1314, 1315, 1241, 1242, 1243, 1244, 1316, 1319, 1247
};

// Rings - desecrated_prefixes
uint16_t rings_desecrated_prefixes[7] = {
    1261, 1196, 1197, 1198, 1262, 1264, 1269
};

// Rings - desecrated_suffixes
uint16_t rings_desecrated_suffixes[15] = {
    1271, 1272, 1273, 1274, 1206, 1275, 1282, 1281, 1280, 1279, 1278, 1213, 1288, 1287, 1286
};

// Rings - essence_prefixes
uint16_t rings_essence_prefixes[3] = {
    1322, 1323, 1250
};

// Rings - essence_suffixes
uint16_t rings_essence_suffixes[9] = {
    1325, 1326, 1327, 1328, 1255, 1333, 1334, 1335, 1336
};

// Gloves_dex - normal_prefixes
uint16_t gloves_dex_normal_prefixes[10] = {
    1291, 1292, 1219, 1295, 1090, 1220, 1221, 1222, 1223, 1297
};

// Gloves_dex - normal_suffixes
uint16_t gloves_dex_normal_suffixes[16] = {
    1302, 1305, 1306, 1307, 1309, 1168, 1312, 1241, 1242, 1243, 1244, 1036, 1037, 1038, 1319, 1175
};

// Gloves_dex - desecrated_suffixes
uint16_t gloves_dex_desecrated_suffixes[13] = {
    1275, 1271, 1272, 1001, 992, 1002, 1281, 1282, 1139, 1288, 997, 998, 999
};

// Gloves_dex - essence_prefixes
uint16_t gloves_dex_essence_prefixes[3] = {
    1322, 1323, 1051
};

// Gloves_dex - essence_suffixes
uint16_t gloves_dex_essence_suffixes[11] = {
    1325, 1326, 1327, 1056, 1057, 1333, 1334, 1335, 1061, 1336, 1063
};

// Gloves_dex_int - normal_prefixes
uint16_t gloves_dex_int_normal_prefixes[10] = {
    1291, 1292, 1011, 1014, 1017, 1220, 1221, 1222, 1223, 1297
};

// Gloves_dex_int - normal_suffixes
uint16_t gloves_dex_int_normal_suffixes[18] = {
    1302, 1301, 1305, 1306, 1307, 1309, 1168, 1312, 1241, 1242, 1243, 1244, 1036, 1037, 1038, 1319, 1176, 1175
};

// Gloves_dex_int - desecrated_suffixes
uint16_t gloves_dex_int_desecrated_suffixes[16] = {
    1271, 1272, 1002, 992, 1275, 1139, 1282, 1281, 1003, 1004, 1288, 997, 998, 1005, 1006, 999
};

// Gloves_dex_int - essence_prefixes
uint16_t gloves_dex_int_essence_prefixes[4] = {
    1322, 1323, 1184, 1051
};

// Gloves_dex_int - essence_suffixes
uint16_t gloves_dex_int_essence_suffixes[11] = {
    1325, 1327, 1328, 1056, 1057, 1333, 1334, 1335, 1061, 1336, 1063
};

// Gloves_int - normal_prefixes
uint16_t gloves_int_normal_prefixes[10] = {
    1291, 1292, 1293, 1296, 1091, 1220, 1221, 1222, 1223, 1297
};

// Gloves_int - normal_suffixes
uint16_t gloves_int_normal_suffixes[17] = {
    1302, 1303, 1305, 1306, 1307, 1309, 1168, 1312, 1241, 1242, 1243, 1244, 1036, 1037, 1038, 1319, 1176
};

// Gloves_int - desecrated_suffixes
uint16_t gloves_int_desecrated_suffixes[15] = {
    1275, 1271, 1272, 992, 1281, 1282, 1139, 1003, 1004, 1288, 997, 998, 1005, 1006, 999
};

// Gloves_int - essence_prefixes
uint16_t gloves_int_essence_prefixes[4] = {
    1322, 1323, 1181, 1051
};

// Gloves_int - essence_suffixes
uint16_t gloves_int_essence_suffixes[11] = {
    1325, 1327, 1328, 1056, 1057, 1333, 1334, 1335, 1061, 1336, 1063
};

// Gloves_str - normal_prefixes
uint16_t gloves_str_normal_prefixes[10] = {
    1291, 1292, 1083, 1294, 1089, 1220, 1221, 1222, 1223, 1297
};

// Gloves_str - normal_suffixes
uint16_t gloves_str_normal_suffixes[17] = {
    1301, 1302, 1305, 1306, 1307, 1309, 1168, 1312, 1241, 1242, 1243, 1244, 1036, 1037, 1038, 1319, 1174
};

// Gloves_str - desecrated_suffixes
uint16_t gloves_str_desecrated_suffixes[12] = {
    1275, 1271, 1272, 992, 1000, 1281, 1282, 1139, 1288, 997, 998, 999
};

// Gloves_str - essence_prefixes
uint16_t gloves_str_essence_prefixes[4] = {
    1322, 1323, 1179, 1051
};

// Gloves_str - essence_suffixes
uint16_t gloves_str_essence_suffixes[11] = {
    1325, 1326, 1327, 1056, 1057, 1333, 1334, 1335, 1061, 1336, 1063
};

// Gloves_str_int - normal_prefixes
uint16_t gloves_str_int_normal_prefixes[10] = {
    1291, 1292, 1010, 1013, 1016, 1220, 1221, 1222, 1223, 1297
};

// Gloves_str_int - normal_suffixes
uint16_t gloves_str_int_normal_suffixes[18] = {
    1301, 1302, 1305, 1306, 1307, 1309, 1168, 1312, 1241, 1242, 1243, 1244, 1036, 1037, 1038, 1319, 1176, 1174
};

// Gloves_str_int - desecrated_suffixes
uint16_t gloves_str_int_desecrated_suffixes[16] = {
    1275, 1271, 1272, 992, 1000, 1281, 1282, 1139, 1003, 1004, 1288, 997, 998, 1005, 1006, 999
};

// Gloves_str_int - essence_prefixes
uint16_t gloves_str_int_essence_prefixes[4] = {
    1322, 1323, 1183, 1051
};

// Gloves_str_int - essence_suffixes
uint16_t gloves_str_int_essence_suffixes[12] = {
    1325, 1326, 1327, 1328, 1056, 1057, 1333, 1334, 1335, 1061, 1336, 1063
};

// Gloves_str_dex - normal_prefixes
uint16_t gloves_str_dex_normal_prefixes[10] = {
    1291, 1292, 1009, 1012, 1015, 1220, 1221, 1222, 1223, 1297
};

// Gloves_str_dex - normal_suffixes
uint16_t gloves_str_dex_normal_suffixes[19] = {
    1301, 1302, 1303, 1305, 1306, 1307, 1309, 1168, 1312, 1241, 1242, 1243, 1244, 1036, 1037, 1038, 1319, 1174, 1175
};

// Gloves_str_dex - desecrated_suffixes
uint16_t gloves_str_dex_desecrated_suffixes[14] = {
    1275, 1271, 1272, 1001, 992, 1002, 1000, 1281, 1282, 1139, 1288, 997, 998, 999
};

// Gloves_str_dex - essence_prefixes
uint16_t gloves_str_dex_essence_prefixes[4] = {
    1322, 1323, 1182, 1051
};

// Gloves_str_dex - essence_suffixes
uint16_t gloves_str_dex_essence_suffixes[11] = {
    1325, 1326, 1327, 1056, 1057, 1333, 1334, 1335, 1061, 1336, 1063
};

// Body_Armours_str - normal_prefixes
uint16_t body_armours_str_normal_prefixes[7] = {
    1291, 1083, 1294, 1089, 881, 884, 1299
};

// Body_Armours_str - normal_suffixes
uint16_t body_armours_str_normal_suffixes[12] = {
    1301, 1305, 1306, 1307, 1309, 1168, 894, 1314, 896, 897, 898, 1174
};

// Body_Armours_str - desecrated_suffixes
uint16_t body_armours_str_desecrated_suffixes[10] = {
    1275, 1271, 1272, 1134, 862, 1281, 1282, 866, 1288, 867
};

// Body_Armours_str - essence_prefixes
uint16_t body_armours_str_essence_prefixes[5] = {
    1322, 1179, 906, 907, 908
};

// Body_Armours_str - essence_suffixes
uint16_t body_armours_str_essence_suffixes[6] = {
    1325, 1326, 913, 1333, 1334, 1335
};

// Body_Armours_str_int - normal_prefixes
uint16_t body_armours_str_int_normal_prefixes[7] = {
    1291, 1010, 1013, 1016, 820, 884, 1299
};

// Body_Armours_str_int - normal_suffixes
uint16_t body_armours_str_int_normal_suffixes[14] = {
    1301, 1303, 1305, 1306, 1307, 1309, 1168, 894, 1314, 896, 897, 898, 901, 1174
};

// Body_Armours_str_int - desecrated_suffixes
uint16_t body_armours_str_int_desecrated_suffixes[11] = {
    1275, 1271, 1272, 1134, 862, 1281, 1282, 1284, 866, 1288, 867
};

// Body_Armours_str_int - essence_prefixes
uint16_t body_armours_str_int_essence_prefixes[5] = {
    1322, 1183, 906, 907, 908
};

// Body_Armours_str_int - essence_suffixes
uint16_t body_armours_str_int_essence_suffixes[7] = {
    1325, 1326, 1328, 913, 1333, 1334, 1335
};

// Body_Armours_str_dex - normal_prefixes
uint16_t body_armours_str_dex_normal_prefixes[7] = {
    1291, 1009, 1012, 1015, 819, 884, 1299
};

// Body_Armours_str_dex - normal_suffixes
uint16_t body_armours_str_dex_normal_suffixes[14] = {
    1301, 1302, 1305, 1306, 1307, 1309, 1168, 894, 1314, 896, 897, 898, 1174, 1175
};

// Body_Armours_str_dex - desecrated_suffixes
uint16_t body_armours_str_dex_desecrated_suffixes[12] = {
    1275, 1271, 1272, 1134, 862, 1281, 1282, 866, 1288, 868, 869, 867
};

// Body_Armours_str_dex - essence_prefixes
uint16_t body_armours_str_dex_essence_prefixes[5] = {
    1322, 1182, 906, 907, 908
};

// Body_Armours_str_dex - essence_suffixes
uint16_t body_armours_str_dex_essence_suffixes[7] = {
    1325, 1326, 1327, 913, 1333, 1334, 1335
};

// Body_Armours_int - normal_prefixes
uint16_t body_armours_int_normal_prefixes[7] = {
    1291, 1293, 1296, 1091, 883, 884, 1299
};

// Body_Armours_int - normal_suffixes
uint16_t body_armours_int_normal_suffixes[12] = {
    1303, 1305, 1306, 1307, 1309, 1168, 894, 1314, 896, 897, 898, 901
};

// Body_Armours_int - desecrated_suffixes
uint16_t body_armours_int_desecrated_suffixes[11] = {
    1275, 1271, 1272, 1134, 862, 1281, 1282, 1284, 866, 1288, 867
};

// Body_Armours_int - essence_prefixes
uint16_t body_armours_int_essence_prefixes[5] = {
    1322, 1181, 906, 907, 908
};

// Body_Armours_int - essence_suffixes
uint16_t body_armours_int_essence_suffixes[6] = {
    1325, 1328, 913, 1333, 1334, 1335
};

// Body_Armours_dex - normal_prefixes
uint16_t body_armours_dex_normal_prefixes[7] = {
    1291, 1219, 1295, 1090, 882, 884, 1299
};

// Body_Armours_dex - normal_suffixes
uint16_t body_armours_dex_normal_suffixes[12] = {
    1302, 1305, 1306, 1307, 1309, 1168, 894, 1314, 896, 897, 898, 1175
};

// Body_Armours_dex - desecrated_suffixes
uint16_t body_armours_dex_desecrated_suffixes[12] = {
    1275, 1271, 1272, 1134, 862, 1281, 1282, 866, 1288, 868, 869, 867
};

// Body_Armours_dex - essence_prefixes
uint16_t body_armours_dex_essence_prefixes[5] = {
    1322, 1180, 906, 907, 908
};

// Body_Armours_dex - essence_suffixes
uint16_t body_armours_dex_essence_suffixes[6] = {
    1325, 1327, 913, 1333, 1334, 1335
};

// Body_Armours_dex_int - normal_prefixes
uint16_t body_armours_dex_int_normal_prefixes[7] = {
    1291, 1011, 1014, 1017, 821, 884, 1299
};

// Body_Armours_dex_int - normal_suffixes
uint16_t body_armours_dex_int_normal_suffixes[14] = {
    1302, 1303, 1305, 1306, 1307, 1309, 1168, 894, 1314, 896, 897, 898, 901, 1175
};

// Body_Armours_dex_int - desecrated_suffixes
uint16_t body_armours_dex_int_desecrated_suffixes[13] = {
    1275, 1271, 1272, 1134, 862, 1281, 1282, 1284, 866, 1288, 868, 869, 867
};

// Body_Armours_dex_int - essence_prefixes
uint16_t body_armours_dex_int_essence_prefixes[5] = {
    1322, 1184, 906, 907, 908
};

// Body_Armours_dex_int - essence_suffixes
uint16_t body_armours_dex_int_essence_suffixes[7] = {
    1325, 1327, 1328, 913, 1333, 1334, 1335
};

// Wands - normal_prefixes
uint16_t wands_normal_prefixes[11] = {
    568, 1300, 404, 405, 406, 407, 408, 409, 410, 411, 412
};

// Wands - normal_suffixes
uint16_t wands_normal_suffixes[18] = {
    1303, 1168, 1310, 416, 417, 418, 419, 420, 1315, 1243, 1244, 1316, 587, 588, 1247, 428, 429, 430
};

// Wands - desecrated_prefixes
uint16_t wands_desecrated_prefixes[5] = {
    389, 390, 391, 392, 393
};

// Wands - desecrated_suffixes
uint16_t wands_desecrated_suffixes[8] = {
    394, 395, 396, 553, 398, 399, 400, 401
};

// Wands - essence_prefixes
uint16_t wands_essence_prefixes[1] = {
    595
};

// Wands - essence_suffixes
uint16_t wands_essence_suffixes[7] = {
    1326, 1327, 1328, 600, 436, 606, 607
};

// Quarterstaves - normal_prefixes
uint16_t quarterstaves_normal_prefixes[8] = {
    1220, 1221, 1222, 1223, 353, 354, 1297, 356
};

// Quarterstaves - normal_suffixes
uint16_t quarterstaves_normal_suffixes[15] = {
    1302, 1303, 1168, 1312, 1241, 1242, 1243, 1244, 1036, 1037, 368, 1038, 1173, 371, 372
};

// Quarterstaves - desecrated_prefixes
uint16_t quarterstaves_desecrated_prefixes[6] = {
    336, 55, 339, 57, 340, 59
};

// Quarterstaves - desecrated_suffixes
uint16_t quarterstaves_desecrated_suffixes[6] = {
    1134, 61, 1139, 63, 64, 653
};

// Quarterstaves - essence_prefixes
uint16_t quarterstaves_essence_prefixes[9] = {
    373, 374, 375, 376, 1051, 378, 379, 380, 381
};

// Quarterstaves - essence_suffixes
uint16_t quarterstaves_essence_suffixes[7] = {
    382, 1326, 1327, 1328, 386, 387, 388
};

// Foci - normal_prefixes
uint16_t foci_normal_prefixes[11] = {
    568, 1300, 1094, 1226, 1227, 1228, 1229, 577, 1296, 1293, 1094
};

// Foci - normal_suffixes
uint16_t foci_normal_suffixes[13] = {
    1303, 1305, 1306, 1307, 1309, 1168, 1310, 1315, 1316, 587, 588, 1176, 901
};

// Foci - desecrated_prefixes
uint16_t foci_desecrated_prefixes[6] = {
    551, 552, 553, 554, 555, 556
};

// Foci - desecrated_suffixes
uint16_t foci_desecrated_suffixes[11] = {
    1271, 1272, 559, 560, 1275, 1282, 1281, 564, 1139, 1288, 567
};

// Foci - essence_prefixes
uint16_t foci_essence_prefixes[5] = {
    1322, 1179, 1180, 1181, 595
};

// Foci - essence_suffixes
uint16_t foci_essence_suffixes[12] = {
    1325, 1326, 1327, 1328, 600, 601, 602, 1333, 1334, 1335, 606, 607
};

// Bucklers - normal_prefixes
uint16_t bucklers_normal_prefixes[6] = {
    1291, 1219, 1295, 699, 884, 625
};

// Bucklers - normal_suffixes
uint16_t bucklers_normal_suffixes[13] = {
    1302, 1305, 1306, 1307, 1309, 1168, 894, 633, 634, 635, 636, 637, 1175
};

// Bucklers - desecrated_suffixes
uint16_t bucklers_desecrated_suffixes[12] = {
    1271, 1272, 612, 862, 1275, 866, 1282, 1281, 867, 1288, 618, 619
};

// Bucklers - essence_prefixes
uint16_t bucklers_essence_prefixes[5] = {
    1322, 1179, 1180, 1181, 643
};

// Bucklers - essence_suffixes
uint16_t bucklers_essence_suffixes[7] = {
    1325, 1326, 1327, 1328, 1333, 1334, 1335
};

// Staves - normal_prefixes
uint16_t staves_normal_prefixes[11] = {
    568, 1300, 404, 1226, 1227, 1228, 1229, 577, 410, 411, 412
};

// Staves - normal_suffixes
uint16_t staves_normal_suffixes[18] = {
    1303, 1168, 1310, 416, 417, 418, 419, 420, 1315, 1243, 1244, 1316, 587, 588, 1247, 428, 429, 430
};

// Staves - desecrated_prefixes
uint16_t staves_desecrated_prefixes[4] = {
    105, 106, 107, 997
};

// Staves - desecrated_suffixes
uint16_t staves_desecrated_suffixes[5] = {
    109, 110, 567, 112, 113
};

// Staves - essence_prefixes
uint16_t staves_essence_prefixes[1] = {
    595
};

// Staves - essence_suffixes
uint16_t staves_essence_suffixes[7] = {
    1326, 1327, 1328, 600, 436, 606, 607
};

