export default {
    name: 'appointment',
    title: 'Terminbuchungen',
    icon: () => '📅',
    type: 'document',
    fields: [
      {
        name: 'name',
        type: 'string',
        title: 'Name',
      },
      
      {
        name: 'phone',
        type: 'string',
        title: 'Telefonnummer',
      },
      {
        name: 'email',
        type: 'string',
        title: 'Email',
      },
      
      {
        name: 'uhrzeit',
        title: 'Uhrzeit',
        type: 'string',
        
      },
      
      {
        name: 'link',
        title: 'Link',
        type: 'string',
        
      
     
      },
      
    ],
    
  };
  