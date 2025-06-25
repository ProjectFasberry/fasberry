type RulesTerminItemContent = {
  article_desc: string,
  article_title: string,
  id: string
}

export const RulesTerminItemContent = ({
  article_desc, article_title, id
}: RulesTerminItemContent) => {
  return (
    <div className="flex flex-col mb-6 lg:mb-4">
      <div className="flex-col flex gap-1">
        <p className="text-project-color text-md md:text-lg">
          {id}{`)`}&nbsp;
          <span className="text-white font-semibold">
            {article_title}
          </span>
          {article_desc && (
            <span className="inline text-neutral-400">
              &nbsp;- {article_desc}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export const RulesTerminItem = ({
  categoryTitle, content,
}: { categoryTitle: string, content: any[] }) => {
  if (!content) return null;
  return (
    <div
      id={categoryTitle}
      className="flex flex-col py-2 group md:py-4 px-2 md:px-4 border-2 border-[#454545] duration-300 rounded-lg"
    >
      <h1 className="text-gold text-xl md:text-4xl text-shadow-xl mb-6">
        {categoryTitle}
      </h1>
      {content.map(item => <RulesTerminItemContent key={item.id} {...item} />)}
    </div>
  );
};