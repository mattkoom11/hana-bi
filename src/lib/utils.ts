export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const cn = (...classes: Array<string | undefined | false | null>) =>
  classes.filter(Boolean).join(" ");

