import Intgrations, { MyIntegrations } from "@/types/integrations";

const integrations: MyIntegrations[] = [
  {
    id: crypto.randomUUID().toString(),
    imageURL:
      "https://app-v2.pepperpay.com.br/_nuxt/logo-whatsapp.CLlhKBVs.png",
    total: 0,
    title: "WhatsApp",
  },
  {
    id: crypto.randomUUID().toString(),
    imageURL:
      "https://app-v2.pepperpay.com.br/_nuxt/logo-activecampaign.CV2ee055.png",
    total: 0,
    title: "ActiveCampaign",
  },
];
const automations: MyIntegrations[] = [
  {
    id: crypto.randomUUID().toString(),
    imageURL: "https://app-v2.pepperpay.com.br/_nuxt/logo-voxuy.CFktqNtn.jpeg",
    total: 0,
    title: "Voxuy",
  },
  {
    id: crypto.randomUUID().toString(),
    imageURL:
      "https://app-v2.pepperpay.com.br/_nuxt/logo-sellflux.CeNNJn0p.png",
    total: 0,
    title: "SellFlux",
  },
  {
    id: crypto.randomUUID().toString(),
    imageURL:
      "https://app-v2.pepperpay.com.br/_nuxt/logo-reportana.B9Be1ECd.jpeg",
    total: 0,
    title: "Reportana",
  },
  {
    id: crypto.randomUUID().toString(),
    imageURL:
      "data:image/jpeg;base64,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mb2LiT6spSi2die+FMvJvIVGjayG9xRnGEyMqlRqYS00ZtM7d51ANqk+0KJXUcYzsiv3wWkWdSLovFRVCnnlXEJ2wyGm1IDc81bZyi2die+LOttKVhRIUlUZ2RV754LaJWdo1CanjqdsO2ae+LIn1ZKie3LktitmiP7iy/MdVUysyS+JcdkFl2lQRUGOlIw993OAy1SpUakwlhBmlgSPzasG7YgvAUcTzo9C/wDYf7gt2NCmp1cVXh8O/wD/xAApEAABAgUCBQQDAAAAAAAAAAABABEhMUFRYZGhEEBxgcEwsdHwcOHx/9oACAEBAAE/Ifx0LXEE8O4s6qQ6p26Mp/qwAele3LTTO0qDz2Rpy3YkEYueq7m8I3Zi0RFBIiECVANj35UV01skxRws8AkU4gtU9ws1IdGD+OTnLsBAuP4WqAYEBloSmA8xRbBNK67XyD0QudHc3OUypfwgXM0ygzkPlTFACYFz8H5Bs7AbI0mxPZFxmV2wRbXxU6G8ptZoGowcrYJMmC/qmDfiUURvVzEFzy6TFsVFSotkOY3fX15HSfoxvKmLyNog/jgbMPqpmNWE9fF5gW4UthPXPkWQJR4wnFXCVP2SKCbAevMncDOQ5jiJHdFxhzZuE8sWzOJRQGYLegZyvu7ozs7EeQj3uyp1P4QedFVW5UcLA2R5+za8gGaDEQLD+kxgTgD4QLay4gbICGaL2CPYuVfA7L7u6VpwwBhotNQC3shSQQlxWPwbk8S3sgwT4AZB7nhCCV7KfX2HKtgsEm39iNEPcuOrIKXmK2z9oX5i1RFOusILp6MN+VBYuIFCwyzHUDPrwnAoosxb0CXVEkiSXJr+Ov/aAAwDAQACAAMAAAAQ999999999999999999999999999999999999999999997299999999999W80999999996mVPow999999995/x/K99999999t7Ove999999999E0e999999999999999999999999999999999999999999999999999999999//EACIRAQACAQUAAwEBAQAAAAAAAAERITEAQVFhcTCBkVAgof/aAAgBAwEBPxD+ZEF3b9AWvhoREWIIP21+x8jLREQcE/2tTxHGqEq3WChDK3czmtOzMEnmQH8P34cYTPuwHawGqhVoCPk3XMfhokIcKRZgbNX3pfAwiEmEsKMzOfqtFTDoHSHKzDESlomJixKT/v8As1pEQ5kKfkx3q0ijCiKs0bu51B4dW82Rs67zrzTR1VD0s00WFeAbUaTGOLnSycvV4IF7WDjx+FCSWUWXoIfcToceEbV38zbg260WkVJZyFt7XUxCdhCwswk6hX6t/XK+vxYKMSDDJgTmqTre9TUE9z0MW+X0aZWQxPLlftV/tf/EACURAQABAwMDBAMAAAAAAAAAAAERACExQVGBMHGRUGHB8LHR8f/aAAgBAgEBPxD0y7g+52q6wGYRjjqAJvvzY8UXvhoWgnSrdxZ8g9HPUvrxUdKe/wAMOacibY1shzzSU4cywrli8OkYpc8rLFTbysmYnCO3QTKBknaSKhAIaglo1SmZdqd85zn3ru5kn3Jce2tHub0nDy/NZAWuVljt0Rdibg/kpy/DGxjzV/tTPCKg7WWgdDcqetffHSQ58w6XyP7qWQ+yV7E4rNqv4cHrX//EACgQAQABAgUDBAMBAQAAAAAAAAERACExQVFhcRBAkYGhsfEwwfBw0f/aAAgBAQABPxD/ADo/KizLJBC1RqCUX5oYbjy+9CAEz+cLNgZq3gO2ifKClTC7KKMxmdBjODigYLWy7AtWNqmx8U0D2SgQQL5hHMSirPHA2CZF9izA7UkYmp2IPlocDJLKiI+gvl6LADo4iKG4SclCTEtYh8p7NEBcgdErpuocpqz2bAX8Xe9JWKNACyAq5qb1/a1pcafFBuEDEbXGiejYsqYo3VmtAkTeaLIi6p6BSWZBVHiNOGWoBsVSxuoZx2A9CgykymZcGwbNAPKBDBsdrwOgBQFUggE1kRdoc0YuWghCyGQbJX9rWkSFBl9xJ44V9ur9uqwwJXTg2G+rYwjM3G/kkaPmGNiCiMhgDcFj8+TPXf8AqfKv5w0cx0qZFFhyhcmNGFZW4R+s0c8enlhdo2o5Y0zlaGNyRbkw6YdHF+b35xTGYt7oufr84VHqwgysrg7FsUw9ImEGz3vdxkRqw9KxoG8XV9up9upMTgJvMpn49MJ8ZVsIyImSMI0zUpBjNIEXeHFAlKQDHiS3AFii6nnZgpjmEA+iz2AYHEALJShsgMop5c2gHmFK4qAGQCC5V9nShddMhVcALq5BV6AaQbFixG9x6YSbRywSEIit78NJCaN3J83+1B1NTpYpi2wlnPZlgkkuYBfL7UmQDDEQnuEPL0v94SycePmkQTfC7WBSoaAdQ8nKaCHAsYpjzJGYtfq8f1xNG5grioB8QBkBROULSKkfQPMO1QkQZEYRqS5A5AwGA+Q6y36K5xyDhOIhFyXQG9OWRKmVdf8AOv/Z",
    total: 0,
    title: "Hotzapp",
  },
];
const member: MyIntegrations[] = [
  {
    id: crypto.randomUUID().toString(),
    imageURL: "https://app-v2.pepperpay.com.br/_nuxt/logo-cademi.DDJQimsp.webp",
    total: 0,
    title: "Cademi",
  },

  {
    id: crypto.randomUUID().toString(),
    imageURL:
      "https://app-v2.pepperpay.com.br/_nuxt/logo-memberkit.DyHHIAfx.jpg",
    total: 0,
    title: "Memberkit",
  },
];
const fiscalNotes: MyIntegrations[] = [
  {
    id: crypto.randomUUID().toString(),
    imageURL: "https://app-v2.pepperpay.com.br/_nuxt/logo-notasy.B-yyFYie.webp",
    total: 0,
    title: "Notasy",
  },
  {
    id: crypto.randomUUID().toString(),
    imageURL:
      "data:image/jpeg;base64,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",
    total: 0,
    title: "Spedy",
  },
];
const sms: MyIntegrations[] = [
  {
    id: crypto.randomUUID().toString(),
    imageURL: "https://app-v2.pepperpay.com.br/_nuxt/logo-gtisms.D53TBvoU.png",
    total: 0,
    title: "GTI SMS",
  },
  {
    id: crypto.randomUUID().toString(),
    imageURL: "https://app-v2.pepperpay.com.br/_nuxt/logo-nemu.DcYbdZ-2.png",
    total: 0,
    title: "Nemu",
  },
  {
    id: crypto.randomUUID().toString(),
    imageURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAdVBMVEX///8xVr9rhtGbrd95ktby9Ps8X8Jhfs7Q2fG9yOo3W8H5+v1AY8S4xOgzWMDq7vji5/ZNbchyi9Pb4fRog9Csu+VHaMaOotw/YsPI0u5desyywOfEz+1Qb8iAl9eUp97l6vdXdcujs+KQo9zU3PGGm9l3j9UdCKDlAAAFFUlEQVR4nO2Y6ZaiMBCFiQgoUdC2xbUVbe33f8SRpBIqAZc5AzPjOff7o2LEuqS2VBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/haLk7hDNoj+tXG/Rf55R8jqX1v2Mvudfl21yUin6jv5nf9DC19kmg2lerNMGzqKkfpmtp28gxAhtjP17jL3dGy1+ZtCvIkQMddPvkwcHQe1U3IZi7cRItJQGR0dWHjs9KWPTLyRECE+dJa1gUKbNNPu9kZCTKBsJvzTfi3eTogoxurz4svujzxn4g2FiGylzM+H2VKHR10k/2shG/1SCxFioCsKZeMv0RCy9+6xWH4fhh4ykFd6O/srQtZn9cIzlQnxoMq6rD6mS1o6cFQcJ6KF27aOTdxJ5x/DWDPsVohIV9qDjsyKNTUswTe/qDciGggmJDrGbTKUkIAeTnblfzimiJuXHQu5uZLOubuC2XGs1OW8NBYLtarKArWQBf9NQ0h0IiXLoPGL9NKtjkqI+NI2jriPbMtgz60clGrNuMrEVshmfU+H0BnDWG19Nd/SlXHHOpQQMdEh7zQnxSqrP6RX7ednLYp+W/ptmS8kGFGImTQhh/T1sWsdWoiITcg3e98K8g15FY6QpHUxF0LKbyWJemv66MV/d0Ju1UPf+thik4gpzI3hJGRXr0iWm5ELWSo/aEVYfTLOO+8hI1tbPvUznDb3ZKLj8mJDRguRNqROi/v3z8n90pv3Rux9f0JMyC98x0+0wk2dZ7UQUyay60M/MWlqsojM7px70MGEiLn2oJl7cD9QmLN6oYVQ/hE/T/5hR3ucrNw79idErKl0/9SXqOGSB5bCtJAZKft62oBdzb3oefUzkHGefnbUZofGbOqFvemKEmI867mfRFv+40nXlbBNyM1P9LaTO1DT5c+7lBDqXlIK9M/EhQ+QSlZZeZXvU4hItGGbKuQHOkuO/T5ECSH/m5PD+8nOaSzHdQfQ24TMF2KHPydx9c69rpHkbUnwgpAgtJd7m1g2hNgyrjtgU80bRg5+R8jCXO6+NbkvhKqwJh+0fK+MpK5p/oqQ/GQux/6hrHshaZ1gs4NJqTzMa1OVkdTMxIsXhLB83kd34gpJQmZLQsMUVuWzurVSRprDMTnLJHbhZTIUjL6ipLY9mLKip7I9l1ZccldISZkofloQ9+5uXZ+t/0Mhn2q8a1nvIj6Z3+ZB5AqxTXzypOPIqbmMT2ZrexcSlCdmO28eq77QF7K3Hx/uianr2XRm28fehVSThTZU5+ILCeygaD56sCkmQG4etTHtYx9h4gqxWZVDvtAQMq6XzL93YxdzfzM0UQ5oerg++l/fOnn2EymV+qaQ4CDuQw/dpIRCpUHZ44mkYZ3fWm2NRzeF1HXunpCI3M+MUaRphLs/IzaFuMOqDxvJTSEPxlokxOyZ7UwuL59iOhDCnzQ7xrYIebAnSsiSYmJQ32XXvNQNNiI+2EV7uuY9nrRGsqmtDB+MTC9k9BfLUtLMUVlD1wnlMG0KuXVSlQ2xMw40QuLQeZjRedA2xb7ZHpHjFW57RRm++7pIM19XSHUKKdxDKQnZNo+q+WZ3Dj2ktVhM3dURreg+c2lH8oQEI79gS+0RLxczOdOUf27hy385LZpCmqvat+P/ovx5Op66CcnCXiZSnSJ3T6cCcjt6tgQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOucXb8M6TE8UNbYAAAAASUVORK5CYII=",
    total: 0,
    title: "Mex10",
  },
  {
    id: crypto.randomUUID().toString(),
    imageURL:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAYFBMVEUA28T///+N7eL5//5E5NN4699b59f0/v0A3Mb3/v78///w/fzS+fW79e/Z+veo8uq09O3k/PnF9/Ii4Mzi+/nK+PNd59id8ehr6dsg38uT7+WC7eHW+fZO5dQ04c+s8OZwpVztAAAE80lEQVR4nO2c61biQBCEoyCEoCCCKCrs+7/luruiMKkwndCT7snW95tzTMM41ZfqFAUhhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBCvlK/P1Y0LNreHFAEeHqwDO2Gx1Q9w92wd1Rlz/RBfrGMKWOyUAzzMrUMKuVOO8N3JJfPDg3KEv6wDqrEZfIQL5QhvrQOq8aQc4djdTfOuHGHxaB1RwGqtHaG3H/FWO8CieLOO6Yz7Uj/C9cY6qlNe9QP8FH3rqE54SPATflZP99ZxfTPdpwiwKLY4czPI55ZpAixKXCEub3snSQH8B6wYL6n+nAWwSJxPrB9LkcMKhZjmYjMCJ+AJmiZmlB8owhQJhhmvUBsSJIlmYMVYJbu+DZhMB68YSxThbEg/4vo/VYxRknLGiB2sMYalGCMUYq0HfRiro93Jb+QJRTgPW0Pv1UiXqj9R2s8kioFP8zX0p0klVIz5OPgYPs3dWag3EJvBNcZjcNmU8DR3R3vadBHYWhyFNQY+zV157vW23i3QM9QUA57mjtS+v8TcwacIzxE+zd3QnhfGKOFYfxPeBXojq9o9lpwJvCjD+7yEp7kLBtWLUDGUAqydjh7ArcXH4FMNPda2VCZdBKgYVdhvxxVzW2zy+h0cRtVUS0MxKqNuHlSMqqYYCqNVq/oaZ2W17PF6xZgnGjXF2cKs7C34FM5/2pBq1CQAXpTzsIq7u3L+pm9KkIP/x2qKcWWNoe4raQMcRk3Dm29yVY1x31vvAnGAivEUFopXmXGMu3jYsxg+1DWKEX5dfYPtC5vwYHU340x7rylCtvC5QsVYd1aMpXkfVjiM6mrG8TDVwjVGKNK4Yo7jYjIJU+tRmGjh/CeGul+9E3gYVbsCt3cdML9m/gH/x6pBDaOgfcHHAVMCN2NcXBJKYMXYOLjo1djDZoxhWacPVgwnN6EKayj71kmzKrAZMyzFwPaFQSkGLBRNGxDK4NTasomkzlhkX8gaPIyqN3P3kyhbnzozlhneJvNpnF5NCXLwMCpoLYqapx9OhVRkX8AGgOBbcev+hzVGdaYYoiFGaMzxg8C+IBlE2Y2a4kQt0iL7iWuFge37E/uCZCDsO0vA7ftvs89eMmdznuldNLyJlMJ7to53ab8UQ2LH9F9xXTC8iSy1/k3/FxRDMrvo377Wnm2T4Q33xgOy6F5hxTjIlCKLDmSD4W0imQM7V4oj0L5QSV5Y8OFcKY5g+4KAkdOysE7Xga/2K2fS0fHtCzPHNUVIw9sXImShFF90sgitMhD7H/YdLEKZzRvbO4M37hPSc0Qp2hnua4qQtoqR3yQO2xcambptIDbTbvswJ6U40soZXHNOZ0Gb7cPQy5gJcsXoc/9VE/n2YTY1RYh0l6Tf/VdNhNuHswyV4ohsl8TvqCmOSDFyaCA2I1GMTJXiSFwxLPZfNYm+2LXKpIHYTGyXJP/32kQG91b7r5pcNl/4HzXFuagYnk0Jci5tH7o2JYi50Fr0bUqQ07x9mL1SHGlSDO+mBDkN24dDeosd3qUdglIcgcOoQa1jQPuC/f6rJkAxBrUWVaAaI7NRU5zQvjCo9cS/BO/r8W9fa8/5MCq/UVOcM99eTqYEOaf2hRxHTQJ+LpvngdQUIeXbV6X4MDAp/KHcL1c3s6fXAd4yhBBCCCGEEEIIIYQQQgghhBDigt843EaNNGMobQAAAABJRU5ErkJggg==",
    total: 0,
    title: "SMS Funnel",
  },
];
const track: MyIntegrations[] = [
  {
    id: crypto.randomUUID().toString(),
    imageURL: "https://app-v2.pepperpay.com.br/_nuxt/logo-utmify.UzXo3YmJ.png",
    total: 0,
    title: "UTMFY",
  },
  {
    id: crypto.randomUUID().toString(),
    imageURL:
      "https://app-v2.pepperpay.com.br/_nuxt/logo-webhooks.CY9TmuRy.png",
    total: 0,
    title: "Webhooks",
  },
];

let allIntegrations: Intgrations[] = [];

integrations.forEach((item) => {
  allIntegrations.push({
    ...item,
    createdAT: new Date(),
  });
});
fiscalNotes.forEach((item) => {
  allIntegrations.push({
    ...item,
    createdAT: new Date(),
  });
});
track.forEach((item) => {
  allIntegrations.push({
    ...item,
    createdAT: new Date(),
  });
});
member.forEach((item) => {
  allIntegrations.push({
    ...item,
    createdAT: new Date(),
  });
});

automations.forEach((item) => {
  allIntegrations.push({
    ...item,
    createdAT: new Date(),
  });
});

sms.forEach((item) => {
  allIntegrations.push({
    ...item,
    createdAT: new Date(),
  });
});

export {
  allIntegrations,
  integrations,
  automations,
  member,
  fiscalNotes,
  sms,
  track,
};
