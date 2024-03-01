import { Document } from 'mongoose';
import { should } from 'chai';

interface IndexedDocument extends Document {
  [key: string]: any;
}

export default function checkRequiredField(instance: IndexedDocument, field: string, eql: string = 'required') {
  instance[field] = '';

  const error = instance.validateSync();

  should().exist(error);
  error?.should.have.property('errors');
  error?.errors.should.have.property(field);
  error?.errors[field].should.have.property('kind').eql(eql);
}
