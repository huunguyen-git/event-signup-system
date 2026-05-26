export const EventStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
};

export class ICreateEvent {
  id!: string;
  host_id!: string;
  title!: string;
  description?: string;
  event_date!: string;
  end_date!: string;
  banner_url?: string;
  location_url!: string;
  allowed_domain!: string;
  max_attendees!: number;
  status!: string;
  form_config: any;
  created_at!: string;
  imageUri?: string;
  applications?: any[];
}
