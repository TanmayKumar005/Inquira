from agents import build_reader_agent, build_search_agent, writer_chain, critic_chain
from dotenv import load_dotenv
load_dotenv()

def run_research_pipeline(topic:str) -> dict:
     state = {}
     print("\n"+" ="*50)
     print("Search agent working ...")
     print("="*50)

     search_agent = build_search_agent()
     search_result = search_agent.invoke({
          "messages" : [("user", f"Find recent, reliable and detailed information about: {topic}")]
     }) # type: ignore
     state["search_results"] = search_result['messages'][-1].content

     print("\n Search result",state["search_results"])

     print("\n"+" ="*50)
     print("Reader agent working ...")
     print("="*50)

     reader_agent = build_reader_agent()
     reader_result = reader_agent.invoke({
        "messages": [("user",
            f"Based on the following search results about '{topic}', "
            f"pick the most relevant URL and scrape it for deeper content.\n\n"
            f"Search Results:\n{state['search_results'][:800]}"
        )]
    }) # type: ignore

     state['scraped_content'] = reader_result['messages'][-1].content

     print("\nscraped content: \n", state['scraped_content'])

     print("\n"+" ="*50)
     print("Writer is drafting the report ...")
     print("="*50)

     research_combined = (
        f"SEARCH RESULTS : \n {state['search_results']} \n\n"
        f"DETAILED SCRAPED CONTENT : \n {state['scraped_content']}"
    )

     state["report"] = writer_chain.invoke({
        "topic" : topic,
        "research" : research_combined
    })

     print("\n Final Report\n",state['report'])

     print("\n"+" ="*50)
     print("Critic is reviewing ...")
     print("="*50)

     state["feedback"] = critic_chain.invoke({
        "report":state['report']
    })

     print("\n critic report \n", state['feedback'])

     return state



if __name__ == "__main__":
    topic = input("\n Enter a research topic : ")
    run_research_pipeline(topic)



     


