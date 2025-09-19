



export default function HeaderCard({title , color}: {title: string, color: string}) {

  return (
    <div className="flex justify-between items-center  mb-2">
      <h2 className={`font-bold ${color}`}>{title}</h2>
     
    </div>
  );
}
