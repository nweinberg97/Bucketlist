/**
 * Real photography for seeded goals — all free under the Unsplash License
 * (https://unsplash.com/license), hotlinked from images.unsplash.com as Unsplash asks.
 *
 * If a photo can't load (offline, or a host that blocks external images), the card
 * falls back to the goal's illustrated scene, which shows the same activity.
 */
export interface Photo {
  id: string; // images.unsplash.com path, e.g. photo-1638588635868-cd8290af2266
  by: string;
  page: string;
}

const P = (id: string, by: string, page: string): Photo => ({ id, by, page });

export const PHOTOS: Record<string, Photo> = {
  'sarah-surf': P('photo-1638588635868-cd8290af2266', 'Micah McKerlich', 'https://unsplash.com/photos/6Ggsy9bjIHc'),
  'sarah-mural': P('photo-1767330855530-e36897a40e6c', 'Samiul Haque Bhuyan', 'https://unsplash.com/photos/E0_34jZF1T4'),
  'sarah-japan': P('photo-1610238115511-81be15284155', 'Samuel Berner', 'https://unsplash.com/photos/u8fS3_bSWdI'),
  'sarah-openmic': P('photo-1474959783111-a0f551bdad25', 'Nick Karvounis', 'https://unsplash.com/photos/tp_aLk0ngME'),
  'sarah-dad': P('photo-1587306598228-c80f6e5e39ad', 'jk retiza', 'https://unsplash.com/photos/YpsrN4LiDug'),
  'sarah-half': P('photo-1745790289741-12a211a8325d', 'Henry Ren', 'https://unsplash.com/photos/8pNsZRjxtnw'),
  'sarah-pottery': P('photo-1753164725896-f0a39315ff8a', 'Vitaly Gariev', 'https://unsplash.com/photos/a0xqXaRXFrA'),
  'sarah-camp': P('photo-1688435034170-ca82aba7b644', 'Jason An', 'https://unsplash.com/photos/ldCYwrlyHrs'),
  'alex-wct': P('photo-1686852047195-941a73dc376c', 'Greg Rosenke', 'https://unsplash.com/photos/_5OFPLZrN5k'),
  'alex-spanish': P('photo-1758525225676-329ddcedf78f', 'Vitaly Gariev', 'https://unsplash.com/photos/sTHSNecI2n8'),
  'alex-aurora': P('photo-1593378026483-2a1fd46a35bd', 'Johny Goerend', 'https://unsplash.com/photos/x3WQMj5QkEE'),
  'alex-zine': P('photo-1553164995-1fe011843ba8', 'Nate Foong', 'https://unsplash.com/photos/wKHdJcQ8Q5k'),
  'alex-garibaldi': P('photo-1752960542224-0fcc0a81d7c3', 'Anastasiya Dalenka', 'https://unsplash.com/photos/l1ov5RnPsiE'),
  'alex-sushi': P('photo-1562158147-f8d6fbcd76f8', 'Luigi Pozzoli', 'https://unsplash.com/photos/iIS1SIO5_aY'),
  'maya-film': P('photo-1781127445118-8140677fdea1', 'Cemrecan Yurtman', 'https://unsplash.com/photos/UGle_evFpow'),
  'theo-ep': P('photo-1600785381373-703ca5953d42', 'Liz Weddon', 'https://unsplash.com/photos/SYXSofjX7jk'),
  'priya-garden': P('photo-1524247108137-732e0f642303', 'Quilia', 'https://unsplash.com/photos/qo6_mo9dsYg'),
  'dev-ironman': P('photo-1658748721978-68fc04f3739b', 'Markus Spiske', 'https://unsplash.com/photos/XcvocqxlQ-A'),
  'lucia-patagonia': P('photo-1682024619121-aabb0305a496', 'Paulius Dragunas', 'https://unsplash.com/photos/14weKuGAe3I'),
  'ines-book': P('photo-1678501290866-e22dd8caa94a', 'Ilya Yakubovich', 'https://unsplash.com/photos/wgIpkmUMfg8'),
  'kai-game': P('photo-1708876955039-8454e03dd2c6', 'Travis Leery', 'https://unsplash.com/photos/rKxr9ebAMvc'),
  'rosa-residency': P('photo-1644375391877-0ae77eeed8fc', 'Sydney Riggs', 'https://unsplash.com/photos/F9C_2kfv6kA'),
  'priya-dinner': P('photo-1681657687044-9bde75edb38e', 'Bohdan', 'https://unsplash.com/photos/F2lsSOd2DS8'),
  'olivia-sup': P('photo-1670606409379-bd5185d95096', 'Aleksandra B.', 'https://unsplash.com/photos/tTpZovmqSCE'),
  'olivia-volley': P('photo-1725828120196-93020e53481f', 'Frank Huang', 'https://unsplash.com/photos/v22HQ78Xc9o'),
  'marcus-dj': P('photo-1708955340332-4d0d3031580e', 'Elbert Lora', 'https://unsplash.com/photos/GgfhJ1p0r-E'),
  'marcus-pasta': P('photo-1447279506476-3faec8071eee', 'Jorge Zapata', 'https://unsplash.com/photos/4nXkhLCrkLo'),
  'sam-restaurants': P('photo-1709548145082-04d0cde481d4', 'Oliver Guhr', 'https://unsplash.com/photos/EjHiN2KxTO4'),
  'ben-standup': P('photo-1507676385008-e7fb562d11f8', 'Brunxs', 'https://unsplash.com/photos/dtqlaz4HyHw'),
  'elena-skydive': P('photo-1526385604508-05e4e7f0bc61', 'Kamil Pietrzak', 'https://unsplash.com/photos/OSfCunpfKsE'),
  'elena-hikebuddy': P('photo-1708024696554-6d1c3472b049', 'Itsuka Iwaki', 'https://unsplash.com/photos/tCkS8Hnt37k'),
  'noah-canoe': P('photo-1669172463013-0c9a13d75bb4', 'Rye Jessen', 'https://unsplash.com/photos/L5MxQJZGeLM'),
  'noah-lift': P('photo-1574680096145-d05b474e2155', 'Sven Mieke', 'https://unsplash.com/photos/jO6vBWX9h9Y'),
  'hana-workshop': P('photo-1705459965556-a80b1cf0fb5e', 'Caleb Williams', 'https://unsplash.com/photos/Fj5klOSDZxM'),
  'elena-aurora': P('photo-1531366936337-7c912a4589a7', 'Lightscape', 'https://unsplash.com/photos/LtnPejWDSAY'),
  'jamie-cert': P('photo-1783181932190-7bb5da4ecd86', 'John Krach', 'https://unsplash.com/photos/C8xt62FRjIE'),
  'jamie-fiji': P('photo-1476574898132-040f50db0a01', 'Jeremy Bishop', 'https://unsplash.com/photos/zam3m6W2npM'),
  'theo-busk': P('photo-1668024439008-e2da9612d9be', 'Gus Tav', 'https://unsplash.com/photos/gcVatPEmCUU'),
};

export function photoUrl(p: Photo, w: number) {
  return `https://images.unsplash.com/${p.id}?auto=format&fit=crop&w=${w}&q=72`;
}
