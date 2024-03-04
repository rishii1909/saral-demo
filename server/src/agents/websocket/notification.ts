interface BaseNotification {
  type: string;
}

interface NewMailNotification extends BaseNotification {
  type: "new-mail";
  uid: number;
}

export type Notification = NewMailNotification;
