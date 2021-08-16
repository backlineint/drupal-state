interface ApiIndexLinks {
  [key: string]: string;
}

interface ApiIndexResponse {
  data: [],
  links: ApiIndexLinks;
}

const fetchApiIndex = (apiRoot: string): Promise<void | ApiIndexLinks> => {
  const apiIndex = fetch(apiRoot)
    .then(response => response.json() as Promise<ApiIndexResponse>)
    .then(data => data.links)
    .catch(error => console.error(error));
  return apiIndex;
}

export default fetchApiIndex;