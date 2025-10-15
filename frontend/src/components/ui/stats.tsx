

type prop = {
  value: number;
  label: string;
  isCoin: boolean;
  description: string;
};
export default function Stats({ stats }: { stats: prop }) {
  return (
    <figure className="border flex flex-col gap-4 rounded-sm p-2">
      <figcaption>
        <p className="text-sm capitalize">{stats.label}</p>
        <h1 className="font-extrabold text-2xl">
          {Number(stats.value).toLocaleString("pt")}
          {stats.isCoin && " kz"}
        </h1>
        <small className="text-xs opacity-50">{stats.description}</small>
      </figcaption>
    </figure>
  );
}
