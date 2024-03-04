// interface RespondProps<T> {
//   res: any;
//   data?: T;
//   error?: string;
// }

interface RespondDataProps<T> {
  res: any;
  data: T;
  error?: undefined;
}

interface RespondErrorProps<T> {
  res: any;
  data?: undefined;
  error: string;
}

type RespondProps<T> = RespondDataProps<T> | RespondErrorProps<T>;
export const respond = <T>(props: RespondProps<T>) => {
  const { res, data, error } = props;

  if (data) return res.json({ data, success: true });
  return res.json({ error, success: false });
};
